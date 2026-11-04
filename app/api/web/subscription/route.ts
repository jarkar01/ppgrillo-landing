import { fetchPayment, type MercadoPagoPayment } from '@/lib/mercadopago'
import { saveParentSession } from '@/lib/parent-session'
import { activateFromPayment } from '@/lib/payment-activation'
import { getCurrentSubscription, getSubscriptionByEmail, type Subscription } from '@/lib/subscription'
import { findParentRecord, linkWebUserToParent, parentEmailOf, readString } from '@/lib/web-users'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** A payment id from the Mercado Pago return URL only links a device shortly after it was approved. */
const RECENT_PAYMENT_MS = 2 * 60 * 60 * 1000

function paymentEmails(payment: MercadoPagoPayment): string[] {
  const emails = [payment.payer?.email, payment.external_reference]
    .map((e) => e?.trim().toLowerCase())
    .filter((e): e is string => Boolean(e && EMAIL_PATTERN.test(e)))
  return [...new Set(emails)]
}

/**
 * Email of the family that made this payment, when this device may claim it: the checkout was
 * started from this device, or Mercado Pago approved the payment moments ago.
 */
async function claimPaymentEmail(webUserId: string | undefined, payment: MercadoPagoPayment): Promise<string | undefined> {
  const approvedAt = payment.date_approved ? new Date(payment.date_approved).getTime() : Number.NaN
  const recent = Number.isFinite(approvedAt) && Date.now() - approvedAt < RECENT_PAYMENT_MS
  for (const email of paymentEmails(payment)) {
    const record = await findParentRecord(email)
    if (!record || record === 'error') continue
    const sameDevice = Boolean(webUserId) && readString(record.fields, 'web_user_id') === webUserId
    if (sameDevice || recent) return parentEmailOf(record) ?? email
  }
  return undefined
}

function respond(subscription: Subscription, parentEmail?: string, name?: string) {
  return Response.json(
    {
      status: subscription.status,
      plan: subscription.plan,
      expiresAt: subscription.expiresAt,
      linked: Boolean(parentEmail),
      email: parentEmail,
      name: name || subscription.studentName,
    },
    { headers: NO_STORE },
  )
}

export async function GET(request: Request) {
  const { webUser, parentEmail, subscription } = await getCurrentSubscription()
  if (subscription === 'error') {
    return Response.json(
      { status: 'unknown', linked: Boolean(parentEmail), email: parentEmail },
      { status: 503, headers: NO_STORE },
    )
  }
  if (subscription.status === 'active') return respond(subscription, parentEmail, webUser?.name)

  // Back from Mercado Pago with a payment id: confirm it with the Mercado Pago API right away
  // instead of waiting for the webhook, then anchor this device to the payer's email.
  const paymentId = new URL(request.url).searchParams.get('payment_id')
  if (paymentId && /^\d{1,20}$/.test(paymentId)) {
    const payment = await fetchPayment(paymentId)
    if (payment?.status === 'approved') {
      const result = await activateFromPayment(payment)
      if (result.status === 'activated' || result.status === 'already_processed') {
        const email = parentEmail ?? (await claimPaymentEmail(webUser?.id, payment))
        if (email) {
          await saveParentSession(email)
          if (webUser) await linkWebUserToParent(webUser.id, email)
          const refreshed = await getSubscriptionByEmail(email)
          if (refreshed !== 'error') return respond(refreshed, email, webUser?.name)
        }
      }
    }
  }

  return respond(subscription, parentEmail, webUser?.name)
}
