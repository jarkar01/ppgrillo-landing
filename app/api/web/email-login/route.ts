import { cookies } from 'next/headers'
import { z } from 'zod'
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

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(60).optional(),
})

const ERRORS = {
  not_active: { status: 404, error: 'No encontramos un plan activo con ese correo. Revisa que sea el mismo que usaste al pagar.' },
  expired_plan: { status: 403, error: 'El plan de ese correo ya venció. Puedes renovarlo eligiendo un plan.' },
  unavailable: { status: 503, error: 'No pudimos revisar tu cuenta en este momento. Intenta de nuevo.' },
} as const

function fail(reason: keyof typeof ERRORS) {
  const { status, error } = ERRORS[reason]
  return Response.json({ error }, { status })
}

function readStudentName(fields: Record<string, unknown>): string | undefined {
  const value = fields.student_name as { stringValue?: string } | undefined
  return value?.stringValue?.trim() || undefined
}

/** One-click access: if the email has an active plan in Firestore, link this device and open the chat. */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ error: 'Escribe un correo válido.' }, { status: 400 })
  }
  const { email, name } = parsed.data

  const subscription = await getSubscriptionByEmail(email)
  if (subscription === 'error') return fail('unavailable')
  if (subscription.status === 'expired') return fail('expired_plan')
  if (subscription.status !== 'active') return fail('not_active')

  const cookieStore = await cookies()
  let webUser = await getWebUser(cookieStore.get(WEB_USER_COOKIE)?.value)
  if (!webUser) {
    const record = await findParentRecord(email)
    const recordName = record && record !== 'error' ? readStudentName(record.fields) : undefined
    webUser = await createWebUser(name ?? recordName ?? 'Alumno PpGrillo')
    if (!webUser) return fail('unavailable')
  }

  const linked = await patchDocument(`web_users/${webUser.id}`, {
    parent_email: { stringValue: email },
    email_login_at: { timestampValue: new Date().toISOString() },
  })
  if (!linked) return fail('unavailable')

  cookieStore.set(WEB_USER_COOKIE, webUser.id, {
    httpOnly: true,
    secure: true,
    // The v0 preview renders the app inside a cross-site iframe.
    sameSite: 'none',
    path: '/',
    maxAge: WEB_USER_COOKIE_MAX_AGE,
  })
  if (!(await saveParentSession(email))) return fail('unavailable')

  return Response.json({ ok: true, name: webUser.name, email, plan: subscription.plan })
}
