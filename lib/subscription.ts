import { cookies } from 'next/headers'
import type { PaidPlanId } from '@/lib/plans'
import { normalizeEmail, readParentSession, saveParentSession } from '@/lib/parent-session'
import {
  WEB_USER_COOKIE,
  findParentRecord,
  findParentRecordByWebUser,
  getWebUser,
  linkWebUserToParent,
  parentEmailOf,
  readString,
  type FirestoreFields,
  type WebUser,
} from '@/lib/web-users'

export type SubscriptionStatus = 'active' | 'pending_payment' | 'expired' | 'none'

export type Subscription = {
  status: SubscriptionStatus
  plan?: PaidPlanId
  expiresAt?: string
  studentName?: string
}

function timestamp(fields: FirestoreFields, key: string): Date | undefined {
  const value = fields[key]
  if (!value || !('timestampValue' in value)) return undefined
  const date = new Date(value.timestampValue)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** Reads the parent record in `users` where parent_email == email; 'error' when Firestore is unreachable. */
export async function getSubscriptionByEmail(email: string): Promise<Subscription | 'error'> {
  try {
    const record = await findParentRecord(email)
    if (record === 'error') return 'error'
    if (!record) return { status: 'none' }
    const fields = record.fields
    const rawPlan = readString(fields, 'plan') ?? readString(fields, 'checkout_plan')
    const plan: PaidPlanId | undefined = rawPlan === 'standard' || rawPlan === 'family' ? rawPlan : undefined
    const expires = timestamp(fields, 'plan_expires_at')
    const planStatus = readString(fields, 'plan_status')
    const studentName = readString(fields, 'student_name')

    if (planStatus === 'active') {
      if (expires && expires.getTime() <= Date.now()) {
        return { status: 'expired', plan, expiresAt: expires.toISOString(), studentName }
      }
      return { status: 'active', plan, expiresAt: expires?.toISOString(), studentName }
    }
    return { status: planStatus === 'pending_payment' ? 'pending_payment' : 'none', plan, studentName }
  } catch (error) {
    console.error('[subscription] Read error:', error)
    return 'error'
  }
}

export type CurrentSubscription = {
  webUser: WebUser | null
  /** Verified parent email for this device, the only key used to read the plan. */
  parentEmail?: string
  subscription: Subscription | 'error'
}

/**
 * Resolves the verified parent email for this device, then reads the plan by that email only.
 * Order: signed parent cookie → email linked to the device's student → checkout made from this device.
 * Whenever an email is resolved from the fallbacks it is persisted in the signed cookie.
 */
export async function getCurrentSubscription(): Promise<CurrentSubscription> {
  const [sessionEmail, webUser] = await Promise.all([
    readParentSession(),
    (async () => getWebUser((await cookies()).get(WEB_USER_COOKIE)?.value))(),
  ])

  let parentEmail = sessionEmail ?? webUser?.parentEmail
  if (!parentEmail && webUser) {
    const record = await findParentRecordByWebUser(webUser.id)
    if (record === 'error') return { webUser, subscription: 'error' }
    parentEmail = record ? parentEmailOf(record) : undefined
  }
  if (!parentEmail) return { webUser, subscription: { status: 'none' } }

  parentEmail = normalizeEmail(parentEmail)
  if (!sessionEmail) await saveParentSession(parentEmail)
  if (webUser && webUser.parentEmail !== parentEmail) await linkWebUserToParent(webUser.id, parentEmail)

  return { webUser, parentEmail, subscription: await getSubscriptionByEmail(parentEmail) }
}
