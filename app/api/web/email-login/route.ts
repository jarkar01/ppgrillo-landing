import { cookies } from 'next/headers'
import { z } from 'zod'
import { requestLoginCode, verifyLoginCode } from '@/lib/email-login'
import { saveParentSession } from '@/lib/parent-session'
import { getSubscriptionByEmail } from '@/lib/subscription'
import {
  WEB_USER_COOKIE,
  WEB_USER_COOKIE_MAX_AGE,
  createWebUser,
  findParentRecord,
  getWebUser,
  patchDocument,
} from '@/lib/web-users'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const email = z.string().trim().toLowerCase().email().max(254)

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('request'), email }),
  z.object({
    action: z.literal('verify'),
    email,
    code: z.string().trim().regex(/^\d{6}$/),
    name: z.string().trim().min(1).max(60).optional(),
  }),
])

const REQUEST_ERRORS = {
  not_active: { status: 404, error: 'No encontramos un plan activo con ese correo. Revisa que sea el mismo que usaste al pagar.' },
  expired_plan: { status: 403, error: 'El plan de ese correo ya venció. Puedes renovarlo eligiendo un plan.' },
  cooldown: { status: 429, error: 'Ya te enviamos un código hace unos segundos. Revisa tu correo (y la carpeta de spam).' },
  send_failed: { status: 502, error: 'No pudimos enviar el código. Intenta de nuevo en un momento.' },
  unavailable: { status: 503, error: 'No pudimos revisar tu cuenta en este momento. Intenta de nuevo.' },
} as const

const VERIFY_ERRORS = {
  invalid: { status: 400, error: 'El código no es correcto. Revísalo e intenta de nuevo.' },
  expired: { status: 410, error: 'El código venció. Pide uno nuevo.' },
  too_many_attempts: { status: 429, error: 'Demasiados intentos. Pide un código nuevo.' },
  unavailable: { status: 503, error: 'No pudimos revisar tu cuenta en este momento. Intenta de nuevo.' },
} as const

function readStudentName(fields: Record<string, unknown>): string | undefined {
  const value = fields.student_name as { stringValue?: string } | undefined
  return value?.stringValue?.trim() || undefined
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'Escribe un correo y código válidos.' }, { status: 400 })
  }
  const body = parsed.data

  if (body.action === 'request') {
    const result = await requestLoginCode(body.email)
    if (result.ok) return Response.json({ ok: true })
    const { status, error } = REQUEST_ERRORS[result.reason]
    return Response.json({ error }, { status })
  }

  const result = await verifyLoginCode(body.email, body.code)
  if (!result.ok) {
    const { status, error } = VERIFY_ERRORS[result.reason]
    return Response.json({ error }, { status })
  }

  const cookieStore = await cookies()
  let webUser = await getWebUser(cookieStore.get(WEB_USER_COOKIE)?.value)
  if (!webUser) {
    const record = await findParentRecord(body.email)
    const recordName = record && record !== 'error' ? readStudentName(record.fields) : undefined
    webUser = await createWebUser(body.name ?? recordName ?? 'Alumno PpGrillo')
    if (!webUser) {
      return Response.json({ error: VERIFY_ERRORS.unavailable.error }, { status: 503 })
    }
  }

  const linked = await patchDocument(`web_users/${webUser.id}`, {
    parent_email: { stringValue: body.email },
    email_login_at: { timestampValue: new Date().toISOString() },
  })
  if (!linked) {
    return Response.json({ error: VERIFY_ERRORS.unavailable.error }, { status: 503 })
  }

  cookieStore.set(WEB_USER_COOKIE, webUser.id, {
    httpOnly: true,
    secure: true,
    // The v0 preview renders the app inside a cross-site iframe.
    sameSite: 'none',
    path: '/',
    maxAge: WEB_USER_COOKIE_MAX_AGE,
  })
  if (!(await saveParentSession(body.email))) {
    return Response.json({ error: VERIFY_ERRORS.unavailable.error }, { status: 503 })
  }
  const subscription = await getSubscriptionByEmail(body.email)
  const plan = subscription !== 'error' ? subscription.plan : undefined
  return Response.json({ ok: true, name: webUser.name, email: body.email, plan })
}
