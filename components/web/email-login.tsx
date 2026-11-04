'use client'

import { useId, useState, type FormEvent } from 'react'
import { useSWRConfig } from 'swr'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { PRIMARY_BUTTON } from '@/components/web/start-free'
import { readLocalStudent, saveLocalStudent } from '@/lib/local-student'
import { savePaidSession } from '@/lib/paid-session'
import type { PaidPlanId } from '@/lib/plans'

const INPUT =
  'min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#25D366] focus:outline-none'

async function post(body: Record<string, string | undefined>) {
  const res = await fetch('/api/web/email-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    name?: string
    email?: string
    plan?: PaidPlanId
  }
  return { ok: res.ok, error: data.error, name: data.name, email: data.email, plan: data.plan }
}

/** "¿Ya pagaste?" access: verifies the plan by email with a one-time code and anchors this device to it. */
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
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState(defaultEmail)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { mutate } = useSWRConfig()
  const id = useId()

  async function requestCode(event?: FormEvent) {
    event?.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const result = await post({ action: 'request', email })
    setBusy(false)
    if (!result.ok) {
      setError(result.error ?? 'No pudimos enviar el código. Intenta de nuevo.')
      return
    }
    setStep('code')
  }

  async function verify(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const local = readLocalStudent()
    const result = await post({ action: 'verify', email, code, name: local?.name })
    if (!result.ok) {
      setBusy(false)
      setError(result.error ?? 'No pudimos verificar el código. Intenta de nuevo.')
      return
    }
    const studentName = local?.name ?? result.name ?? 'Alumno PpGrillo'
    savePaidSession({ email: result.email ?? email, plan: result.plan, name: studentName })
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
          {step === 'email'
            ? (intro ??
              'Escribe el correo que usaste al pagar en Mercado Pago. Te enviaremos un código de 6 dígitos para confirmar que es tuyo.')
            : `Enviamos un código a ${email}. Escríbelo aquí para abrir el chat en este dispositivo.`}
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={requestCode} className="flex flex-col gap-3">
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
            {busy ? 'Buscando tu plan…' : 'Enviarme el código'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="flex flex-col gap-3">
          <label htmlFor={`${id}-code`} className="sr-only">
            Código de 6 dígitos
          </label>
          <input
            id={`${id}-code`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className={`${INPUT} text-center font-mono text-xl tracking-[0.4em]`}
          />
          <button type="submit" disabled={busy || code.length !== 6} className={PRIMARY_BUTTON}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {busy ? 'Verificando…' : 'Entrar al chat'}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setCode('')
                setError(null)
              }}
              className="inline-flex min-h-11 items-center gap-1 font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Cambiar correo
            </button>
            <button
              type="button"
              onClick={() => void requestCode()}
              disabled={busy}
              className="min-h-11 font-semibold text-[#128C7E] hover:underline disabled:opacity-50"
            >
              Reenviar código
            </button>
          </div>
        </form>
      )}

      {error ? (
        <p role="alert" className="text-sm leading-relaxed text-red-600">
          {error}
        </p>
      ) : null}
    </section>
  )
}
