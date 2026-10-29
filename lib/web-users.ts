import { randomUUID } from 'node:crypto'
import { getGoogleAuth } from '@/lib/google-auth'
import type { PaidPlanId } from '@/lib/plans'

export const WEB_USER_COOKIE = 'ppg_web_uid'
export const WEB_USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2

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
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { timestampValue: string }
  | { nullValue: null }
type FirestoreFields = Record<string, FirestoreValue>

type FirestoreContext = { base: string; headers: Record<string, string> }

async function firestoreContext(): Promise<FirestoreContext | null> {
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

async function patchDocument(path: string, fields: FirestoreFields): Promise<boolean> {
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
  if (!res.ok) console.error('[web-users] Update failed:', path, res.status, await res.text())
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

export async function saveCheckoutIntent(intent: {
  webUser: WebUser | null
  phone: string
  phoneE164: string
  plan: PaidPlanId
}): Promise<boolean> {
  const now = new Date().toISOString()
  try {
    const saved = await patchDocument(`${CHECKOUT_INTENTS}/${randomUUID()}`, {
      phone: { stringValue: intent.phone },
      phone_e164: { stringValue: intent.phoneE164 },
      plan: { stringValue: intent.plan },
      name: intent.webUser?.name ? { stringValue: intent.webUser.name } : { nullValue: null },
      web_user_id: intent.webUser ? { stringValue: intent.webUser.id } : { nullValue: null },
      status: { stringValue: 'pending_payment' },
      created_at: { timestampValue: now },
    })
    if (intent.webUser) {
      await patchDocument(`${WEB_USERS}/${intent.webUser.id}`, {
        phone: { stringValue: intent.phone },
        phone_e164: { stringValue: intent.phoneE164 },
        checkout_plan: { stringValue: intent.plan },
        checkout_requested_at: { timestampValue: now },
      })
    }
    return saved
  } catch (error) {
    console.error('[web-users] Checkout intent error:', error)
    return false
  }
}
