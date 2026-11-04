import { z } from 'zod'
import { saveParentSession } from '@/lib/parent-session'
import { toParentEmail } from '@/lib/parent-users'
import { getSubscriptionByEmail } from '@/lib/subscription'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) })

const ERRORS = {
  not_active: { status: 404, error: 'No encontramos un plan activo con ese correo. Revisa que sea el mismo que usaste al pagar.' },
  unavailable: { status: 503, error: 'No pudimos revisar tu cuenta en este momento. Intenta de nuevo.' },
} as const

function fail(reason: keyof typeof ERRORS) {
  const { status, error } = ERRORS[reason]
  return Response.json({ error }, { status })
}

/** One-click access: `users/{email}` with `plan_status == 'active'` signs the device in. */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  const email = parsed.success ? toParentEmail(parsed.data.email) : undefined
  if (!email) return Response.json({ error: 'Escribe un correo válido.' }, { status: 400 })

  const subscription = await getSubscriptionByEmail(email)
  if (subscription === 'error') return fail('unavailable')
  if (subscription.status !== 'active') return fail('not_active')
  if (!(await saveParentSession(email))) return fail('unavailable')

  return Response.json({ ok: true, name: subscription.studentName, email, plan: subscription.plan })
}
