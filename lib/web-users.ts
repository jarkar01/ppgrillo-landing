import { createHash, randomUUID } from 'node:crypto'
import { getGoogleAuth } from '@/lib/google-auth'
import type { PaidPlanId } from '@/lib/plans'

export const WEB_USER_COOKIE = 'ppg_web_uid'
export const WEB_USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2

const USERS = 'users'
const WEB_USERS = 'web_users'
const CHECKOUT_INTENTS = 'checkout_intents'
const REQUEST_TIMEOUT_MS = 5_000
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type WebUser = {
  id: string
  name: string
  taskCount: number
  currentTaskText?: string
  lastTaskActivityAt?: Date
  parentEmail?: string
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { timestampValue: string }
  | { doubleValue: number }
  | { nullValue: null }
export type FirestoreFields = Record<string, FirestoreValue>

type FirestoreContext = { base: string; headers: Record<string, string> }

export async function firestoreContext(): Promise<FirestoreContext | null> {
  const auth = getGoogleAuth()
  if (!auth) return null
  const projectId = await auth
    .getProjectId()
    .catch(() => process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null)
  const token = await auth.getAccessToken().catch((error: unknown) => {
    console.error('[web-users] Firestore access token could not be obtained:', error)
    return null
  })
  if (!projectId || !token) return null
  return {
    base: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  }
}

export function isValidWebUserId(id: string | undefined): id is string {
  return Boolean(id && UUID_PATTERN.test(id))
}

function readString(fields: FirestoreFields, key: string): string | undefined {
  const value = fields[key]
  return value && 'stringValue' in value && value.stringValue ? value.stringValue : undefined
}

function readInt(fields: FirestoreFields, key: string): number {
  const value = fields[key]
  return value && 'integerValue' in value ? Number(value.integerValue) || 0 : 0
}

function readDate(fields: FirestoreFields, key: string): Date | undefined {
  const value = fields[key]
  if (!value || !('timestampValue' in value)) return undefined
  const date = new Date(value.timestampValue)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toWebUser(id: string, fields: FirestoreFields): WebUser {
  return {
    id,
    name: readString(fields, 'name') ?? '',
    taskCount: readInt(fields, 'task_count'),
    currentTaskText: readString(fields, 'current_task_text'),
    lastTaskActivityAt: readDate(fields, 'last_task_activity_at'),
    parentEmail: readString(fields, 'parent_email')?.trim().toLowerCase(),
  }
}

export async function getWebUser(id: string | undefined): Promise<WebUser | null> {
  if (!isValidWebUserId(id)) return null
  try {
    const ctx = await firestoreContext()
    if (!ctx) return null
    const res = await fetch(`${ctx.base}/${WEB_USERS}/${id}`, {
      headers: ctx.headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (res.status === 404) return null
    if (!res.ok) {
      console.error('[web-users] Read failed:', res.status, await res.text())
      return null
    }
    const doc = (await res.json()) as { fields?: FirestoreFields }
    return toWebUser(id, doc.fields ?? {})
  } catch (error) {
    console.error('[web-users] Read error:', error)
    return null
  }
}

export async function createWebUser(name: string): Promise<WebUser | null> {
  const id = randomUUID()
  const now = new Date().toISOString()
  try {
    const ctx = await firestoreContext()
    if (!ctx) return null
    const res = await fetch(`${ctx.base}/${WEB_USERS}?documentId=${id}`, {
      method: 'POST',
      headers: ctx.headers,
      body: JSON.stringify({
        fields: {
          name: { stringValue: name },
          task_count: { integerValue: '0' },
          plan: { stringValue: 'free' },
          source: { stringValue: 'web' },
          created_at: { timestampValue: now },
        } satisfies FirestoreFields,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!res.ok) {
      console.error('[web-users] Create failed:', res.status, await res.text())
      return null
    }
    return { id, name, taskCount: 0 }
  } catch (error) {
    console.error('[web-users] Create error:', error)
    return null
  }
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
  if (!res.ok) {
    console.error('[web-users] Update failed:', ctx.base.split('/')[6], path, res.status, await res.text())
  }
  return res.ok
}

export async function saveTaskProgress(
  user: WebUser,
  progress: { taskCount: number; currentTaskText?: string; activityAt: Date },
): Promise<boolean> {
  try {
    return await patchDocument(`${WEB_USERS}/${user.id}`, {
      task_count: { integerValue: String(progress.taskCount) },
      current_task_text: progress.currentTaskText
        ? { stringValue: progress.currentTaskText }
        : { nullValue: null },
      last_task_activity_at: { timestampValue: progress.activityAt.toISOString() },
    })
  } catch (error) {
    console.error('[web-users] Task progress error:', error)
    return false
  }
}

export type BillingPeriod = 'monthly' | 'quarterly'

/** Stable document id in `users` for a parent email; keeps the address out of the document path. */
export function emailUserDocId(email: string): string {
  return `email_${createHash('sha256').update(email.trim().toLowerCase()).digest('hex')}`
}

export type ParentRecord = { id: string; fields: FirestoreFields }

async function getUserDoc(ctx: FirestoreContext, id: string): Promise<ParentRecord | null> {
  const res = await fetch(`${ctx.base}/${USERS}/${encodeURIComponent(id)}`, {
    headers: ctx.headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`users/${id} read failed: ${res.status} ${await res.text()}`)
  const doc = (await res.json()) as { fields?: FirestoreFields }
  return { id, fields: doc.fields ?? {} }
}

async function queryUsersByField(ctx: FirestoreContext, field: string, email: string): Promise<ParentRecord[]> {
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
  if (!res.ok) throw new Error(`users query on ${field} failed: ${res.status} ${await res.text()}`)
  const rows = (await res.json()) as { document?: { name: string; fields?: FirestoreFields } }[]
  return rows.flatMap((row) =>
    row.document ? [{ id: row.document.name.split('/').pop() ?? '', fields: row.document.fields ?? {} }] : [],
  )
}

/**
 * Finds the parent record in `users` for an email. Families may be stored under the plain email as
 * document id, under the hashed id written by the web checkout, or under any id with a matching
 * `parent_email`/`email` field. An active record always wins over pending ones.
 */
export async function findParentRecord(rawEmail: string): Promise<ParentRecord | null | 'error'> {
  const email = rawEmail.trim().toLowerCase()
  try {
    const ctx = await firestoreContext()
    if (!ctx) return 'error'
    const results = await Promise.all([
      getUserDoc(ctx, email).then((doc) => (doc ? [doc] : [])),
      getUserDoc(ctx, emailUserDocId(email)).then((doc) => (doc ? [doc] : [])),
      queryUsersByField(ctx, 'parent_email', email),
      queryUsersByField(ctx, 'email', email),
    ])
    const unique = new Map<string, ParentRecord>()
    for (const doc of results.flat()) if (!unique.has(doc.id)) unique.set(doc.id, doc)
    const records = [...unique.values()]
    return records.find((doc) => readString(doc.fields, 'plan_status') === 'active') ?? records[0] ?? null
  } catch (error) {
    console.error('[web-users] Parent record lookup failed:', error)
    return 'error'
  }
}

/** Parent record in `users`; `plan_status` moves to 'active' once Mercado Pago confirms the payment. */
async function upsertEmailUser(intent: {
  webUser: WebUser | null
  parentEmail: string
  plan: PaidPlanId
  period: BillingPeriod
  now: string
}): Promise<boolean> {
  return patchDocument(`${USERS}/${emailUserDocId(intent.parentEmail)}`, {
    parent_email: { stringValue: intent.parentEmail },
    plan: { stringValue: intent.plan },
    period: { stringValue: intent.period },
    report_channel: { stringValue: 'email' },
    source: { stringValue: 'web_checkout' },
    plan_status: { stringValue: 'pending_payment' },
    student_name: intent.webUser?.name ? { stringValue: intent.webUser.name } : { nullValue: null },
    web_user_id: intent.webUser ? { stringValue: intent.webUser.id } : { nullValue: null },
    checkout_requested_at: { timestampValue: intent.now },
    updated_at: { timestampValue: intent.now },
  })
}

export async function saveCheckoutIntent(intent: {
  webUser: WebUser | null
  parentEmail: string
  plan: PaidPlanId
  period: BillingPeriod
}): Promise<boolean> {
  const now = new Date().toISOString()
  try {
    const [userSaved, intentSaved] = await Promise.all([
      upsertEmailUser({ ...intent, now }),
      patchDocument(`${CHECKOUT_INTENTS}/${randomUUID()}`, {
        parent_email: { stringValue: intent.parentEmail },
        plan: { stringValue: intent.plan },
        period: { stringValue: intent.period },
        name: intent.webUser?.name ? { stringValue: intent.webUser.name } : { nullValue: null },
        web_user_id: intent.webUser ? { stringValue: intent.webUser.id } : { nullValue: null },
        status: { stringValue: 'pending_payment' },
        created_at: { timestampValue: now },
      }),
    ])
    if (intent.webUser) {
      await patchDocument(`${WEB_USERS}/${intent.webUser.id}`, {
        parent_email: { stringValue: intent.parentEmail },
        plan: { stringValue: intent.plan },
        period: { stringValue: intent.period },
        checkout_requested_at: { timestampValue: now },
      })
    }
    return userSaved && intentSaved
  } catch (error) {
    console.error('[web-users] Checkout intent error:', error)
    return false
  }
}
