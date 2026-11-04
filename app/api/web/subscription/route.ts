import { fetchPayment, type MercadoPagoPayment } from '@/lib/mercadopago'
import { activateFromPayment } from '@/lib/payment-activation'
import { getCurrentSubscription, getSubscriptionByEmail } from '@/lib/subscription'
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
 * Links this device to the family that made the payment. Allowed when the parent record was created
 * by a checkout from this same device, or when Mercado Pago just approved the payment.
 */
async function linkDeviceFromPayment(webUserId: string, payment: MercadoPagoPayment): Promise<string | undefined> {
  const approvedAt = payment.date_approved ? new Date(payment.date_approved).getTime() : Number.NaN
  const recent = Number.isFinite(approvedAt) && Date.now() - approvedAt < RECENT_PAYMENT_MS
  for (const email of paymentEmails(payment)) {
    const record = await findParentRecord(email)
    if (!record || record === 'error') continue
    const sameDevice = readString(record.fields, 'web_user_id') === webUserId
    if (!sameDevice && !recent) continue
    const parentEmail = parentEmailOf(record) ?? email
    await linkWebUserToParent(webUserId, parentEmail)
    return parentEmail
  }
  return undefined
}

export async function GET(request: Request) {
  const { webUserId, parentEmail, subscription } = await getCurrentSubscription()
  if (subscription === 'error') {
    return Response.json({ status: 'unknown' }, { status: 503, headers: NO_STORE })
  }
  if (subscription.status === 'active' || !webUserId) {
    return Response.json(subscription, { headers: NO_STORE })
  }

  // When Mercado Pago redirects back with a payment id, confirm it directly with the Mercado Pago
  // API instead of waiting for the webhook. Activation is idempotent and only ever trusts the API.
  const paymentId = new URL(request.url).searchParams.get('payment_id')
  if (paymentId && /^\d{1,20}$/.test(paymentId)) {
    const payment = await fetchPayment(paymentId)
    if (payment?.status === 'approved') {
      const result = await activateFromPayment(payment)
      if (result.status === 'activated' || result.status === 'already_processed') {
        const email = parentEmail ?? (await linkDeviceFromPayment(webUserId, payment))
        if (email) {
          const refreshed = await getSubscriptionByEmail(email)
          if (refreshed !== 'error') return Response.json(refreshed, { headers: NO_STORE })
        }
      }
    }
  }

  return Response.json(subscription, { headers: NO_STORE })
}
