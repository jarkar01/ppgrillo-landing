import { cookies } from 'next/headers'
import { z } from 'zod'
import { MERCADOPAGO_FAMILY_URL, MERCADOPAGO_STANDARD_URL } from '@/lib/plans'
import { WEB_USER_COOKIE, getWebUser, saveCheckoutIntent } from '@/lib/web-users'
import { normalizePhone, phoneE164 } from '@/lib/whatsapp-users'

const bodySchema = z.object({
  plan: z.enum(['standard', 'family']),
  phone: z.string().trim().min(10).max(20),
})

const CHECKOUT_URLS = {
  standard: MERCADOPAGO_STANDARD_URL,
  family: MERCADOPAGO_FAMILY_URL,
} as const

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'Escribe tu número de WhatsApp a 10 dígitos.' }, { status: 400 })
  }

  const digits = parsed.data.phone.replace(/\D/g, '')
  const phone = normalizePhone(parsed.data.phone)
  if (digits.length < 10 || !/^\d{10}$/.test(phone)) {
    return Response.json({ error: 'Escribe tu número de WhatsApp a 10 dígitos.' }, { status: 400 })
  }

  const webUser = await getWebUser((await cookies()).get(WEB_USER_COOKIE)?.value)
  const saved = await saveCheckoutIntent({
    webUser,
    phone,
    phoneE164: phoneE164(parsed.data.phone),
    plan: parsed.data.plan,
  })
  if (!saved) {
    return Response.json(
      { error: 'No pudimos registrar tu número. Intenta de nuevo en un momento.' },
      { status: 503 },
    )
  }

  return Response.json({ url: CHECKOUT_URLS[parsed.data.plan] })
}
