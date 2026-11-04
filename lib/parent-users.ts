import { randomUUID } from 'node:crypto'
import { getGoogleAuth } from '@/lib/google-auth'
import type { PaidPlanId } from '@/lib/plans'

/**
 * Parent accounts live in `users/{email}`: the normalized parent email is the document id and the
 * only key used for sessions and paid access. `plan_status == 'active'` is what unlocks the chat.
 */
const USERS = 'users'
const CHECKOUT_INTENTS = 'checkout_intents'
const REQUEST_TIMEOUT_MS = 5_000
const EMAIL_PATTERN = /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { timestampValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
export type FirestoreFields = Record<string, FirestoreValue>

type FirestoreContext = { base: string; headers: Record<string, string> }

export type ParentRecord = { email: string; fields: FirestoreFields }

export type BillingPeriod = 'monthly' | 'quarterly'

export async function firestoreContext(): Promise<FirestoreContext | null> {
  const auth = getGoogleAuth()
  if (!auth) return null
  const projectId = await auth
    .getProjectId()
    .catch(() => process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null)
  const token = await auth.getAccessToken().catch((error: unknown) => {
    console.error('[users] Firestore access token could not be obtained:', error)
    return null
  })
  if (!projectId || !token) return null
  return {
    base: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  }
}

/** Lowercased, trimmed email, or undefined when it cannot be used as a document id. */
export function toParentEmail(raw: string | undefined | null): string | undefined {
  const email = raw?.trim().toLowerCase()
  return email && email.length <= 254 && EMAIL_PATTERN.test(email) ? email : undefined
}

export function readString(fields: FirestoreFields, key: string): string | undefined {
  const value = fields[key]
  return value && 'stringValue' in value && value.stringValue ? value.stringValue : undefined
}

export function isPlanActive(record: ParentRecord | null): boolean {
  return Boolean(record) && readString(record!.fields, 'plan_status') === 'active'
}

function userPath(email: string): string {
  return `${USERS}/${encodeURIComponent(email)}`
}

export async function patchDocument(path: string, fields: FirestoreFields): Promise<boolean> {
  const ctx = await firestoreContext()
  if (!ctx) return false
  const mask = Object.keys(fields)
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join('&')
  const res = await fetch(`${ctx.base}/${path}?${mask}`, {
    method: 'PATCH',
    headers: ctx.headers,
    body: JSON.stringify({ fields }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!res.ok) console.error('[users] Update failed:', path, res.status, await res.text())
  return res.ok
}

async function readUserDoc(ctx: FirestoreContext, email: string): Promise<FirestoreFields | null> {
  const res = await fetch(`${ctx.base}/${userPath(email)}`, {
    headers: ctx.headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`users/${email} read failed: ${res.status} ${await res.text()}`)
  return ((await res.json()) as { fields?: FirestoreFields }).fields ?? {}
}

/**
 * One-time migration for families saved before `users/{email}` was the document id: copies the
 * record whose `parent_email` matches into `users/{email}` so every later read is direct.
 * Remove once all legacy documents have been migrated.
 */
async function queryLegacy(ctx: FirestoreContext, field: string, email: string): Promise<FirestoreFields[]> {
  const res = await fetch(`${ctx.base}:runQuery`, {
    method: 'POST',
    headers: ctx.headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: USERS }],
        where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: email } } },
        limit: 10,
      },
    }),
  })
  if (!res.ok) throw new Error(`legacy users query on ${field} failed: ${res.status} ${await res.text()}`)
  const rows = (await res.json()) as { document?: { fields?: FirestoreFields } }[]
  return rows.flatMap((row) => (row.document ? [row.document.fields ?? {}] : []))
}

async function migrateLegacyRecord(ctx: FirestoreContext, email: string): Promise<FirestoreFields | null> {
  const docs = (await Promise.all([queryLegacy(ctx, 'parent_email', email), queryLegacy(ctx, 'email', email)])).flat()
  const legacy = docs.find((f) => readString(f, 'plan_status') === 'active') ?? docs[0]
  if (!legacy) return null

  const { web_user_id: _webUserId, phone: _phone, ...fields } = legacy
  const migrated: FirestoreFields = {
    ...fields,
    parent_email: { stringValue: email },
    migrated_at: { timestampValue: new Date().toISOString() },
  }
  await patchDocument(userPath(email), migrated)
  return migrated
}

/** Reads `users/{email}`. Returns 'error' when Firestore cannot be reached. */
export async function getParentRecord(rawEmail: string): Promise<ParentRecord | null | 'error'> {
  const email = toParentEmail(rawEmail)
  if (!email) return null
  try {
    const ctx = await firestoreContext()
    if (!ctx) return 'error'
    const fields = (await readUserDoc(ctx, email)) ?? (await migrateLegacyRecord(ctx, email))
    return fields ? { email, fields } : null
  } catch (error) {
    console.error('[users] Parent record read failed:', error)
    return 'error'
  }
}

/** Updates `users/{email}`, creating it when missing. */
export function updateParentRecord(email: string, fields: FirestoreFields): Promise<boolean> {
  return patchDocument(userPath(email), { ...fields, parent_email: { stringValue: email } })
}

/**
 * Saves the parent email before Mercado Pago. An already active plan is never moved back to
 * pending, so a paying family can never lose access by opening the checkout again.
 */
export async function saveCheckoutIntent(intent: {
  parentEmail: string
  plan: PaidPlanId
  period: BillingPeriod
  studentName?: string
}): Promise<boolean> {
  const now = new Date().toISOString()
  try {
    const existing = await getParentRecord(intent.parentEmail)
    const active = existing !== 'error' && isPlanActive(existing)
    const [userSaved, intentSaved] = await Promise.all([
      updateParentRecord(intent.parentEmail, {
        report_channel: { stringValue: 'email' },
        source: { stringValue: 'web_checkout' },
        checkout_plan: { stringValue: intent.plan },
        checkout_period: { stringValue: intent.period },
        checkout_requested_at: { timestampValue: now },
        updated_at: { timestampValue: now },
        ...(active
          ? {}
          : {
              plan: { stringValue: intent.plan },
              period: { stringValue: intent.period },
              plan_status: { stringValue: 'pending_payment' },
            }),
        ...(intent.studentName ? { student_name: { stringValue: intent.studentName } } : {}),
      }),
      patchDocument(`${CHECKOUT_INTENTS}/${randomUUID()}`, {
        parent_email: { stringValue: intent.parentEmail },
        plan: { stringValue: intent.plan },
        period: { stringValue: intent.period },
        status: { stringValue: 'pending_payment' },
        created_at: { timestampValue: now },
      }),
    ])
    return userSaved && intentSaved
  } catch (error) {
    console.error('[users] Checkout intent error:', error)
    return false
  }
}
