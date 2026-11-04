'use client'

import { useId, useState, type FormEvent } from 'react'
import { useSWRConfig } from 'swr'
import { Loader2, MailCheck } from 'lucide-react'
import { PRIMARY_BUTTON } from '@/components/web/start-free'
import { readLocalStudent, saveLocalStudent } from '@/lib/local-student'
import { savePaidSession } from '@/lib/paid-session'
import type { PaidPlanId } from '@/lib/plans'

const INPUT =
  'min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#25D366] focus:outline-none'

/** "¿Ya pagaste?" access: looks up the active plan by email and opens the chat on this device in one click. */
export function EmailLogin({
  variant = 'card',
  defaultEmail = '',
  startOpen = false,
  title = '¿Ya pagaste? Entra con tu correo',
  intro,
}: {
  variant?: 'card' | 'inline'
  defaultEmail?: string
  startOpen?: boolean
  title?: string
  intro?: string
}) {
  const [open, setOpen] = useState(startOpen)
  const [email, setEmail] = useState(defaultEmail)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { mutate } = useSWRConfig()
  const id = useId()

  async function enter(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const local = readLocalStudent()
    const res = await fetch('/api/web/email-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: local?.name }),
    }).catch(() => null)
    const data = (await res?.json().catch(() => ({}))) as
      | { error?: string; name?: string; email?: string; plan?: PaidPlanId }
      | undefined
    if (!res?.ok) {
      setBusy(false)
      setError(data?.error ?? 'No pudimos revisar tu plan. Intenta de nuevo.')
      return
    }
    const studentName = local?.name ?? data?.name ?? 'Alumno PpGrillo'
    savePaidSession({ email: data?.email ?? email.trim().toLowerCase(), plan: data?.plan, name: studentName })
    saveLocalStudent({ ...(local ?? { tasksUsed: 0 }), name: studentName, exhausted: false })
    await mutate((key) => typeof key === 'string' && key.startsWith('/api/web/subscription'))
    setBusy(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-[#128C7E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] ${
          variant === 'card' ? 'self-center px-4' : 'self-start'
        }`}
      >
        <MailCheck className="h-4 w-4" aria-hidden="true" />
        ¿Ya pagaste? Entra con tu correo
      </button>
    )
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-3 rounded-2xl border-2 border-emerald-100 bg-emerald-50/60 p-4 text-left"
    >
      <div className="flex flex-col gap-1">
        <h3 id={`${id}-title`} className="font-display text-base font-bold text-balance text-slate-900">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-pretty text-slate-600">
          {intro ?? 'Escribe el correo que usaste al pagar en Mercado Pago y entra directo al chat.'}
        </p>
      </div>

      <form onSubmit={enter} className="flex flex-col gap-3">
        <label htmlFor={`${id}-email`} className="sr-only">
          Correo con el que pagaste
        </label>
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className={INPUT}
        />
        <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {busy ? 'Buscando tu plan…' : 'Entrar al chat'}
        </button>
      </form>

      {error ? (
        <p role="alert" className="text-sm leading-relaxed text-red-600">
          {error}
        </p>
      ) : null}
    </section>
  )
}
