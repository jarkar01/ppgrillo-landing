import { fetchPayment, verifyWebhookSignature } from '@/lib/mercadopago'
import { activateFromPayment } from '@/lib/payment-activation'

export const runtime = 'nodejs'
export const maxDuration = 30

type Notification = { type?: string; action?: string; data?: { id?: string | number } }

export async function POST(request: Request) {
  const url = new URL(request.url)
  const body = ((await request.json().catch(() => null)) ?? {}) as Notification

  const type = body.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic')
  const dataId = String(url.searchParams.get('data.id') ?? body.data?.id ?? url.searchParams.get('id') ?? '')

  if (type !== 'payment' || !/^\d+$/.test(dataId)) {
    return Response.json({ ignored: true })
  }

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) {
    console.error('[mp-webhook] MERCADOPAGO_WEBHOOK_SECRET is not configured; refusing notification')
    return new Response('Webhook not configured', { status: 503 })
  }
  const valid = verifyWebhookSignature({
    signature: request.headers.get('x-signature'),
    requestId: request.headers.get('x-request-id'),
    dataId,
    secret,
  })
  if (!valid) return new Response('Invalid signature', { status: 401 })

  // The notification only carries the id; status and amount always come from the Mercado Pago API.
  const payment = await fetchPayment(dataId)
  if (!payment) return new Response('Payment lookup failed', { status: 502 })

  const result = await activateFromPayment(payment)
  if (result.status === 'error') {
    // Non-2xx makes Mercado Pago retry the notification later.
    return Response.json(result, { status: 500 })
  }
  return Response.json(result)
}
