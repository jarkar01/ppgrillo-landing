import { fetchPayment, type MercadoPagoPayment } from '@/lib/mercadopago'
import { saveParentSession } from '@/lib/parent-session'
import { activateFromPayment } from '@/lib/payment-activation'
import { getCurrentSubscription, getSubscriptionByEmail, type Subscription } from '@/lib/subscription'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
/** A payment id from the Mercado Pago return URL only signs a device in shortly after approval. */
const RECENT_PAYMENT_MS = 2 * 60 * 60 * 1000

function isRecent(payment: MercadoPagoPayment): boolean {
  const approvedAt = payment.date_approved ? new Date(payment.date_approved).getTime() : Number.NaN
  return Number.isFinite(approvedAt) && Date.now() - approvedAt < RECENT_PAYMENT_MS
}

function respond(subscription: Subscription, parentEmail?: string) {
  return Response.json(
    {
      status: subscription.status,
      plan: subscription.plan,
      expiresAt: subscription.expiresAt,
      linked: Boolean(parentEmail),
      email: parentEmail,
      name: subscription.studentName,
    },
    { headers: NO_STORE },
  )
}

/** Plan of the signed-in parent email (`users/{email}`), never of an anonymous device. */
export async function GET(request: Request) {
  const { parentEmail, subscription } = await getCurrentSubscription()
  if (subscription === 'error') {
    return Response.json(
      { status: 'unknown', linked: Boolean(parentEmail), email: parentEmail },
      { status: 503, headers: NO_STORE },
    )
  }
  if (subscription.status === 'active') return respond(subscription, parentEmail)

  // Back from Mercado Pago: confirm the payment with the Mercado Pago API right away instead of
  // waiting for the webhook, then sign this device in with the paying family's email.
  const paymentId = new URL(request.url).searchParams.get('payment_id')
  if (paymentId && /^\d{1,20}$/.test(paymentId)) {
    const payment = await fetchPayment(paymentId)
    if (payment?.status === 'approved') {
      const result = await activateFromPayment(payment)
      const email =
        result.status === 'activated' || result.status === 'already_processed'
          ? (parentEmail ?? (isRecent(payment) ? result.email : undefined))
          : undefined
      if (email) {
        await saveParentSession(email)
        const refreshed = await getSubscriptionByEmail(email)
        if (refreshed !== 'error') return respond(refreshed, email)
      }
    }
  }

  return respond(subscription, parentEmail)
}
