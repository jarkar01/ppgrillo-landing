'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { Modal } from '@/components/web/modal'
import { FREE_LIFETIME_TASKS } from '@/lib/plans'

export const PRIMARY_BUTTON =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] bg-[#25D366] px-5 py-2.5 text-[15px] leading-snug font-semibold text-balance text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70'

export const SECONDARY_BUTTON =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] bg-emerald-50/60 px-5 py-2.5 text-[15px] leading-snug font-semibold text-balance text-[#128C7E] transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]'

const FULL_NAME = /^[\p{L}][\p{L}' .-]*\s+[\p{L}][\p{L}' .-]*$/u

export function StartFreeForm({ onSuccess }: { onSuccess: () => void }) {
  const inputId = useId()
  const errorId = useId()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const clean = name.trim().replace(/\s+/g, ' ')
    if (!FULL_NAME.test(clean) || clean.length > 60) {
      setError('Escribe tu nombre y apellido (por ejemplo: Ana López).')
      return
    }
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/web/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'No pudimos crear tu acceso.')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu acceso.')
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-800">
          Nombre y Apellido
        </label>
        <input
          id={inputId}
          name="name"
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          autoFocus
          required
          maxLength={60}
          placeholder="Ana López"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#25D366] aria-invalid:border-red-400"
        />
        {error ? (
          <p id={errorId} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
        {pending ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        )}
        {pending ? 'Desbloqueando…' : `Desbloquear mis ${FREE_LIFETIME_TASKS} tareas gratis`}
      </button>
      <p className="text-center text-xs text-pretty text-slate-500">
        Sin tarjeta y sin teléfono. Solo te pediremos tu WhatsApp si contratas un plan.
      </p>
    </form>
  )
}

export function StartFreeButton({
  children = 'Empezar gratis',
  variant = 'primary',
}: {
  children?: ReactNode
  variant?: 'primary' | 'secondary'
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={variant === 'primary' ? PRIMARY_BUTTON : SECONDARY_BUTTON}
      >
        <Sparkles className="h-5 w-5 shrink-0" aria-hidden="true" />
        {children}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Empieza con ${FREE_LIFETIME_TASKS} tareas gratis`}
        description={`Solo necesitamos tu nombre. Tus ${FREE_LIFETIME_TASKS} tareas de cortesía son de por vida y se usan aquí mismo, en la web.`}
      >
        {open ? (
          <StartFreeForm
            onSuccess={() => {
              router.push('/app')
              router.refresh()
            }}
          />
        ) : null}
      </Modal>
    </>
  )
}
