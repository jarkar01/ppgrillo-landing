import { cookies } from 'next/headers'
import type { PaidPlanId } from '@/lib/plans'
import {
  WEB_USER_COOKIE,
  findParentRecord,
  findParentRecordByWebUser,
  getWebUser,
  linkWebUserToParent,
  parentEmailOf,
  type FirestoreFields,
} from '@/lib/web-users'

export type SubscriptionStatus = 'active' | 'pending_payment' | 'expired' | 'none'

export type Subscription = {
  status: SubscriptionStatus
  plan?: PaidPlanId
  expiresAt?: string
}

function str(fields: FirestoreFields, key: string): string | undefined {
  const value = fields[key]
  return value && 'stringValue' in value && value.stringValue ? value.stringValue : undefined
}

function timestamp(fields: FirestoreFields, key: string): Date | undefined {
  const value = fields[key]
  if (!value || !('timestampValue' in value)) return undefined
  const date = new Date(value.timestampValue)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** Reads the parent record in `users` matched by email; returns 'error' when Firestore is unreachable. */
export async function getSubscriptionByEmail(email: string): Promise<Subscription | 'error'> {
  try {
    const record = await findParentRecord(email)
    if (record === 'error') return 'error'
    if (!record) return { status: 'none' }
    const fields = record.fields
    const rawPlan = str(fields, 'plan') ?? str(fields, 'checkout_plan')
    const plan: PaidPlanId | undefined = rawPlan === 'standard' || rawPlan === 'family' ? rawPlan : undefined
    const expires = timestamp(fields, 'plan_expires_at')
    const planStatus = str(fields, 'plan_status')

    if (planStatus === 'active') {
      if (expires && expires.getTime() <= Date.now()) return { status: 'expired', plan, expiresAt: expires.toISOString() }
      return { status: 'active', plan, expiresAt: expires?.toISOString() }
    }
    return { status: planStatus === 'pending_payment' ? 'pending_payment' : 'none', plan }
  } catch (error) {
    console.error('[subscription] Read error:', error)
    return 'error'
  }
}

/**
 * Subscription of the student on this device. Uses the parent email linked to the device; if the
 * link was never saved, falls back to the parent record created by a checkout from this device.
 */
export async function getCurrentSubscription(): Promise<{
  webUserId?: string
  parentEmail?: string
  subscription: Subscription | 'error'
}> {
  const webUser = await getWebUser((await cookies()).get(WEB_USER_COOKIE)?.value)
  if (!webUser) return { subscription: { status: 'none' } }
  if (webUser.parentEmail) {
    return {
      webUserId: webUser.id,
      parentEmail: webUser.parentEmail,
      subscription: await getSubscriptionByEmail(webUser.parentEmail),
    }
  }

  const record = await findParentRecordByWebUser(webUser.id)
  if (record === 'error') return { webUserId: webUser.id, subscription: 'error' }
  const parentEmail = record ? parentEmailOf(record) : undefined
  if (!parentEmail) return { webUserId: webUser.id, subscription: { status: 'none' } }

  await linkWebUserToParent(webUser.id, parentEmail)
  return { webUserId: webUser.id, parentEmail, subscription: await getSubscriptionByEmail(parentEmail) }
}
