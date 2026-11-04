import type { PaidPlanId } from '@/lib/plans'
import { readParentSession } from '@/lib/parent-session'
import { getParentRecord, readString } from '@/lib/parent-users'

export type SubscriptionStatus = 'active' | 'pending_payment' | 'expired' | 'none'

export type Subscription = {
  status: SubscriptionStatus
  plan?: PaidPlanId
  expiresAt?: string
  studentName?: string
}

/** Reads `users/{email}`; the plan is active only when `plan_status == 'active'`. */
export async function getSubscriptionByEmail(email: string): Promise<Subscription | 'error'> {
  const record = await getParentRecord(email)
  if (record === 'error') return 'error'
  if (!record) return { status: 'none' }

  const fields = record.fields
  const rawPlan = readString(fields, 'paid_plan') ?? readString(fields, 'plan') ?? readString(fields, 'checkout_plan')
  const plan: PaidPlanId | undefined = rawPlan === 'standard' || rawPlan === 'family' ? rawPlan : undefined
  const expiresValue = fields.plan_expires_at
  const expiresAt = expiresValue && 'timestampValue' in expiresValue ? expiresValue.timestampValue : undefined
  const studentName = readString(fields, 'student_name')
  const planStatus = readString(fields, 'plan_status')

  if (planStatus === 'active') return { status: 'active', plan, expiresAt, studentName }
  return { status: planStatus === 'pending_payment' ? 'pending_payment' : 'none', plan, studentName }
}

export type CurrentSubscription = {
  /** Parent email from the signed session cookie: the only identity in the app. */
  parentEmail?: string
  subscription: Subscription | 'error'
}

export async function getCurrentSubscription(): Promise<CurrentSubscription> {
  const parentEmail = await readParentSession()
  if (!parentEmail) return { subscription: { status: 'none' } }
  return { parentEmail, subscription: await getSubscriptionByEmail(parentEmail) }
}
