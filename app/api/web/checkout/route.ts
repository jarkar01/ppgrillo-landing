import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  MERCADOPAGO_FAMILY_URL,
  MERCADOPAGO_STANDARD_QUARTERLY_URL,
  MERCADOPAGO_STANDARD_URL,
} from '@/lib/plans'
import { WEB_USER_COOKIE, getWebUser, saveCheckoutIntent } from '@/lib/web-users'

const bodySchema = z.object({
  plan: z.enum(['standard', 'family']),
  period: z.enum(['monthly', 'quarterly']).default('monthly'),
  parentEmail: z.string().trim().toLowerCase().max(254).email(),
})

const CHECKOUT_URLS = {
  standard: { monthly: MERCADOPAGO_STANDARD_URL, quarterly: MERCADOPAGO_STANDARD_QUARTERLY_URL },
  family: { monthly: MERCADOPAGO_FAMILY_URL, quarterly: '' },
} as const

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
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

  const webUser = await getWebUser((await cookies()).get(WEB_USER_COOKIE)?.value)
  const saved = await saveCheckoutIntent({
    webUser,
    parentEmail: parsed.data.parentEmail,
    plan: parsed.data.plan,
  })
  if (!saved) {
    return Response.json(
      { error: 'No pudimos registrar el correo. Intenta de nuevo en un momento.' },
      { status: 503 },
    )
  }

  return Response.json({ url: checkoutUrl })
}
