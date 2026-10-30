import { cookies } from 'next/headers'
import { z } from 'zod'
import { MERCADOPAGO_FAMILY_URL, MERCADOPAGO_STANDARD_URL } from '@/lib/plans'
import { WEB_USER_COOKIE, getWebUser, saveCheckoutIntent } from '@/lib/web-users'

const bodySchema = z.object({
  plan: z.enum(['standard', 'family']),
  parentEmail: z.string().trim().toLowerCase().max(254).email(),
})

const CHECKOUT_URLS = {
  standard: MERCADOPAGO_STANDARD_URL,
  family: MERCADOPAGO_FAMILY_URL,
} as const

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json(
      { error: 'Escribe un correo electrónico válido del padre o tutor.' },
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

  return Response.json({ url: CHECKOUT_URLS[parsed.data.plan] })
}
