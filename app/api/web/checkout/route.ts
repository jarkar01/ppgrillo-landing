import { z } from 'zod'
import {
  MERCADOPAGO_FAMILY_URL,
  MERCADOPAGO_STANDARD_QUARTERLY_URL,
  MERCADOPAGO_STANDARD_URL,
} from '@/lib/plans'
import { saveCheckoutIntent, toParentEmail } from '@/lib/parent-users'

const bodySchema = z.object({
  plan: z.enum(['standard', 'family']),
  period: z.enum(['monthly', 'quarterly']).default('monthly'),
  parentEmail: z.string().trim().toLowerCase().max(254).email(),
  studentName: z.string().trim().max(60).optional(),
})

const CHECKOUT_URLS = {
  standard: { monthly: MERCADOPAGO_STANDARD_URL, quarterly: MERCADOPAGO_STANDARD_QUARTERLY_URL },
  family: { monthly: MERCADOPAGO_FAMILY_URL, quarterly: '' },
} as const

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  const parentEmail = parsed.success ? toParentEmail(parsed.data.parentEmail) : undefined
  if (!parsed.success || !parentEmail) {
    return Response.json(
      { error: 'Escribe un correo electrónico válido del padre o tutor.' },
      { status: 400 },
    )
  }

  const checkoutUrl = CHECKOUT_URLS[parsed.data.plan][parsed.data.period]
  if (!checkoutUrl) {
    return Response.json(
      { error: 'Esta opción de pago aún no está disponible. Elige otra opción.' },
      { status: 400 },
    )
  }

  const saved = await saveCheckoutIntent({
    parentEmail,
    plan: parsed.data.plan,
    period: parsed.data.period,
    studentName: parsed.data.studentName || undefined,
  })
  if (!saved) {
    // Never block a sale on a storage outage: the Mercado Pago webhook still receives the
    // payer email and the failure is logged for follow-up.
    console.error('[checkout] Email could not be saved; continuing to Mercado Pago', {
      plan: parsed.data.plan,
      period: parsed.data.period,
    })
  }
  return Response.json({ url: checkoutUrl })
}
