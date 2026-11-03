import { createHmac, timingSafeEqual } from 'node:crypto'

const MP_API = 'https://api.mercadopago.com'
const REQUEST_TIMEOUT_MS = 10_000
const SIGNATURE_MAX_AGE_MS = 10 * 60 * 1000

export type MercadoPagoPayment = {
  id: number
  status: string
  status_detail?: string
  transaction_amount?: number
  currency_id?: string
  date_approved?: string | null
  external_reference?: string | null
  description?: string | null
  payer?: { email?: string | null }
}

/**
 * Validates the `x-signature` header Mercado Pago attaches to webhook notifications.
 * Manifest format: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` signed with HMAC-SHA256.
 */
export function verifyWebhookSignature(params: {
  signature: string | null
  requestId: string | null
  dataId: string
  secret: string
  now?: number
}): boolean {
  if (!params.signature) return false
  const parts = Object.fromEntries(
    params.signature.split(',').map((part) => {
      const [key, ...rest] = part.trim().split('=')
      return [key, rest.join('=')]
    }),
  )
  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return false

  const tsMs = Number(ts) < 1e12 ? Number(ts) * 1000 : Number(ts)
  if (!Number.isFinite(tsMs) || Math.abs((params.now ?? Date.now()) - tsMs) > SIGNATURE_MAX_AGE_MS) {
    return false
  }

  const id = /^[a-z0-9]+$/i.test(params.dataId) ? params.dataId.toLowerCase() : params.dataId
  let manifest = `id:${id};`
  if (params.requestId) manifest += `request-id:${params.requestId};`
  manifest += `ts:${ts};`

  const expected = createHmac('sha256', params.secret).update(manifest).digest('hex')
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(v1, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function fetchPayment(paymentId: string): Promise<MercadoPagoPayment | null> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) {
    console.error('[mercadopago] MERCADOPAGO_ACCESS_TOKEN is not configured')
    return null
  }
  const res = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!res.ok) {
    console.error('[mercadopago] Payment lookup failed:', paymentId, res.status, await res.text())
    return null
  }
  return (await res.json()) as MercadoPagoPayment
}
