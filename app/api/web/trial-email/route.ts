import { z } from 'zod'
import { saveParentSession, saveTrialSession } from '@/lib/parent-session'
import { toParentEmail } from '@/lib/parent-users'
import { getSubscriptionByEmail } from '@/lib/subscription'
import { saveTrialEmail } from '@/lib/trial-users'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  studentName: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((value) => value?.replace(/\s+/g, ' ') || undefined),
})

const UNAVAILABLE = 'No pudimos guardar tu correo en este momento. Intenta de nuevo.'

/** Unlocks the remaining courtesy tasks once a parent email is on file in `users/{email}`. */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  const email = parsed.success ? toParentEmail(parsed.data.email) : undefined
  if (!parsed.success || !email) return Response.json({ error: 'Escribe un correo válido.' }, { status: 400 })
  const { studentName } = parsed.data

  // A family that already paid gets the same one-click access as "¿Ya pagaste?".
  const subscription = await getSubscriptionByEmail(email)
  if (subscription !== 'error' && subscription.status === 'active') {
    if (!(await saveParentSession(email))) return Response.json({ error: UNAVAILABLE }, { status: 503 })
    return Response.json({ ok: true, active: true, email, plan: subscription.plan, name: subscription.studentName ?? studentName })
  }

  if (!(await saveTrialEmail(email, studentName)) || !(await saveTrialSession(email))) {
    return Response.json({ error: UNAVAILABLE }, { status: 503 })
  }
  return Response.json({ ok: true, active: false, email, name: studentName })
}
