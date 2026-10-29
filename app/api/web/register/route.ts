import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  WEB_USER_COOKIE,
  WEB_USER_COOKIE_MAX_AGE,
  createWebUser,
  getWebUser,
} from '@/lib/web-users'

const bodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[\p{L}][\p{L}' .-]*\s+[\p{L}][\p{L}' .-]*$/u),
})

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'Escribe tu nombre y apellido.' }, { status: 400 })
  }

  const cookieStore = await cookies()
  // Re-registering on the same device keeps the lifetime task counter instead of resetting it.
  const existing = await getWebUser(cookieStore.get(WEB_USER_COOKIE)?.value)
  if (existing) return Response.json({ ok: true })

  const name = parsed.data.name.replace(/\s+/g, ' ')
  const user = await createWebUser(name)
  if (!user) {
    return Response.json(
      { error: 'No pudimos crear tu acceso. Intenta de nuevo en un momento.' },
      { status: 503 },
    )
  }

  cookieStore.set(WEB_USER_COOKIE, user.id, {
    httpOnly: true,
    secure: true,
    // The v0 preview renders the app inside a cross-site iframe.
    sameSite: 'none',
    path: '/',
    maxAge: WEB_USER_COOKIE_MAX_AGE,
  })
  return Response.json({ ok: true })
}
