'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Loader2 } from 'lucide-react'
import { BrandIdentity } from '@/components/brand-identity'
import { EmailLogin } from '@/components/web/email-login'
import { StartFreeForm } from '@/components/web/start-free'
import { TutorChat } from '@/components/web/tutor-chat'
import { saveLocalStudent, useLocalStudent } from '@/lib/local-student'
import { savePaidSession, usePaidSession } from '@/lib/paid-session'
import { FREE_LIFETIME_TASKS, type PaidPlanId } from '@/lib/plans'

export function RegisterGate() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-10">
      <BrandIdentity />
      <div className="flex w-full flex-col gap-5 rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-balance text-slate-900">
            Empieza con {FREE_LIFETIME_TASKS} tareas gratis
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-slate-600">
            Solo necesitamos tu nombre para desbloquear tus tareas de cortesía de por vida.
          </p>
        </div>
        <StartFreeForm onSuccess={() => {}} />
        <EmailLogin />
      </div>
    </div>
  )
}

type ServerSession = { status?: string; email?: string; plan?: PaidPlanId; name?: string }

async function fetchServerSession(url: string): Promise<ServerSession> {
  const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin' })
  return (await res.json().catch(() => ({}))) as ServerSession
}

export function WebApp() {
  const student = useLocalStudent()
  const paid = usePaidSession()
  // A device without a local student may still carry a verified paid session in its cookie.
  const probe = student === null && paid === null
  const { data: server, error } = useSWR(probe ? '/api/web/subscription' : null, fetchServerSession, {
    revalidateOnFocus: false,
  })
  const serverPaid = probe && server?.status === 'active' && Boolean(server.email)

  useEffect(() => {
    if (student !== null) return
    if (paid) {
      saveLocalStudent({ name: paid.name ?? 'Alumno PpGrillo', tasksUsed: 0, exhausted: false })
    } else if (serverPaid && server?.email) {
      const name = server.name ?? 'Alumno PpGrillo'
      savePaidSession({ email: server.email, plan: server.plan, name })
      saveLocalStudent({ name, tasksUsed: 0, exhausted: false })
    }
  }, [student, paid, serverPaid, server])

  const resolving = student === null && (paid === undefined || Boolean(paid) || serverPaid || (probe && !server && !error))

  if (student === undefined || resolving) {
    return (
      <div className="flex min-h-svh items-center justify-center" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-[#128C7E]" aria-hidden="true" />
        <span className="sr-only">Cargando…</span>
      </div>
    )
  }

  return student ? <TutorChat name={student.name} initialTasksUsed={student.tasksUsed} initialExhausted={student.exhausted === true} /> : <RegisterGate />
}
