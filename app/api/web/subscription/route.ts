import { fetchPayment } from '@/lib/mercadopago'
import { activateFromPayment } from '@/lib/payment-activation'
import { getCurrentSubscription, getSubscriptionByEmail } from '@/lib/subscription'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET(request: Request) {
  const { parentEmail, subscription } = await getCurrentSubscription()
  if (subscription === 'error') {
    return Response.json({ status: 'unknown' }, { status: 503, headers: NO_STORE })
  }
  if (subscription.status === 'active' || !parentEmail) {
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
        const refreshed = await getSubscriptionByEmail(parentEmail)
        if (refreshed !== 'error') return Response.json(refreshed, { headers: NO_STORE })
      }
    }
  }

  return Response.json(subscription, { headers: NO_STORE })
}
