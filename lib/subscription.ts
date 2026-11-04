import { cookies } from 'next/headers'
import type { PaidPlanId } from '@/lib/plans'
import {
  WEB_USER_COOKIE,
  emailUserDocId,
  firestoreContext,
  getWebUser,
  type FirestoreFields,
} from '@/lib/web-users'

const REQUEST_TIMEOUT_MS = 5_000

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

/** Reads the parent record `users/{emailUserDocId(parent_email)}`; returns 'error' when Firestore is unreachable. */
export async function getSubscriptionByEmail(email: string): Promise<Subscription | 'error'> {
  try {
    const ctx = await firestoreContext()
    if (!ctx) return 'error'
    const res = await fetch(`${ctx.base}/users/${emailUserDocId(email)}`, {
      headers: ctx.headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (res.status === 404) return { status: 'none' }
    if (!res.ok) {
      console.error('[subscription] Read failed:', res.status, await res.text())
      return 'error'
    }
    const fields = ((await res.json()) as { fields?: FirestoreFields }).fields ?? {}
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

/** Subscription of the student on this device, resolved through the parent email linked at checkout. */
export async function getCurrentSubscription(): Promise<{
  parentEmail?: string
  subscription: Subscription | 'error'
}> {
  const webUser = await getWebUser((await cookies()).get(WEB_USER_COOKIE)?.value)
  if (!webUser?.parentEmail) return { subscription: { status: 'none' } }
  return { parentEmail: webUser.parentEmail, subscription: await getSubscriptionByEmail(webUser.parentEmail) }
}
