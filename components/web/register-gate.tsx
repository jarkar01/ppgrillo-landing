'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Loader2 } from 'lucide-react'
import { TutorChat } from '@/components/web/tutor-chat'
import { saveLocalStudent, useLocalStudent } from '@/lib/local-student'
import { savePaidSession, usePaidSession } from '@/lib/paid-session'
import type { PaidPlanId } from '@/lib/plans'

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
  const serverResolved = !probe || Boolean(server) || Boolean(error)

  useEffect(() => {
    if (student !== null) return
    if (paid) {
      saveLocalStudent({ name: paid.name ?? 'Alumno PpGrillo', tasksUsed: 0, exhausted: false })
    } else if (serverPaid && server?.email) {
      const name = server.name ?? 'Alumno PpGrillo'
      savePaidSession({ email: server.email, plan: server.plan, name })
      saveLocalStudent({ name, tasksUsed: 0, exhausted: false })
    } else if (paid === null && serverResolved) {
      // No sign-up: a new visitor starts the first courtesy task anonymously.
      saveLocalStudent({ name: '', tasksUsed: 0 })
    }
  }, [student, paid, serverPaid, server, serverResolved])

  if (!student) {
    return (
      <div className="flex min-h-svh items-center justify-center" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-[#128C7E]" aria-hidden="true" />
        <span className="sr-only">Cargando…</span>
      </div>
    )
  }

  return (
    <TutorChat
      name={student.name}
      trialEmail={student.trialEmail}
      initialTasksUsed={student.tasksUsed}
      initialExhausted={student.exhausted === true}
    />
  )
}
