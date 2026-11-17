'use client'

import { useId, useState, type FormEvent } from 'react'
import { useSWRConfig } from 'swr'
import { Gift, Loader2 } from 'lucide-react'
import { PRIMARY_BUTTON } from '@/components/web/start-free'
import { readLocalStudent, updateLocalStudent } from '@/lib/local-student'
import { trackMetaEvent } from '@/lib/meta-pixel'
import { savePaidSession } from '@/lib/paid-session'
import { EMAIL_UNLOCK_TASKS, type PaidPlanId } from '@/lib/plans'

const INPUT =
  'min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#25D366] focus:outline-none aria-invalid:border-red-400'

type TrialResponse = { error?: string; active?: boolean; email?: string; plan?: PaidPlanId; name?: string }

/** Shown after the anonymous first task: a parent email unlocks the remaining courtesy tasks. */
export function TrialEmailGate() {
  const [email, setEmail] = useState('')
  const [studentName, setStudentName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { mutate } = useSWRConfig()
  const id = useId()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Escribe un correo electrónico válido.')
      return
    }
    setBusy(true)
    setError(null)
    const res = await fetch('/api/web/trial-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, studentName: studentName.trim() || undefined }),
    }).catch(() => null)
    const data = ((await res?.json().catch(() => ({}))) ?? {}) as TrialResponse
    if (!res?.ok) {
      setBusy(false)
      setError(data.error ?? 'No pudimos guardar tu correo. Intenta de nuevo.')
      return
    }
    trackMetaEvent('Lead', { content_name: 'trial_email_task_1' })
    const savedEmail = data.email ?? email.trim().toLowerCase()
    const name = studentName.trim().replace(/\s+/g, ' ') || data.name || readLocalStudent()?.name || ''
    if (data.active) {
      savePaidSession({ email: savedEmail, plan: data.plan, name: name || 'Alumno PpGrillo' })
      await mutate((key) => typeof key === 'string' && key.startsWith('/api/web/subscription'))
    }
    updateLocalStudent({ trialEmail: savedEmail, name, exhausted: false })
    setBusy(false)
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-4 text-left sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
          <Gift className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 id={`${id}-title`} className="font-display text-lg font-bold text-balance text-slate-900">
            ¡Excelente primer paso! Activa tus otras {EMAIL_UNLOCK_TASKS} tareas gratis
          </h2>
          <p className="text-sm leading-relaxed text-pretty text-slate-700">
            Ingresa el correo electrónico de mamá o papá para activar {EMAIL_UNLOCK_TASKS} tareas adicionales sin
            costo y enviarte el reporte de avance de tu hijo.
          </p>
        </div>
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-email`} className="text-sm font-semibold text-slate-800">
            Correo electrónico
          </label>
          <input
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="mama@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={INPUT}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-name`} className="text-sm font-semibold text-slate-800">
            Nombre del alumno <span className="font-normal text-slate-500">(opcional)</span>
          </label>
          <input
            id={`${id}-name`}
            type="text"
            autoComplete="off"
            autoCapitalize="words"
            maxLength={60}
            placeholder="Ana"
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            className={INPUT}
          />
        </div>
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
          {busy ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" /> : null}
          {busy ? 'Activando…' : `Activar ${EMAIL_UNLOCK_TASKS} tareas gratis`}
        </button>
        <p className="text-center text-xs text-pretty text-slate-500">Sin tarjeta. Solo usamos tu correo para enviarte el avance.</p>
      </form>
    </section>
  )
}
