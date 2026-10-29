'use client'

import { useId, useState, type FormEvent } from 'react'
import { CreditCard, ExternalLink, Loader2, Lock } from 'lucide-react'
import { Modal } from '@/components/web/modal'
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/components/web/start-free'
import type { PaidPlanId } from '@/lib/plans'

function CheckoutForm({ plan }: { plan: PaidPlanId }) {
  const inputId = useId()
  const errorId = useId()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Escribe tu número de WhatsApp a 10 dígitos.')
      return
    }
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/web/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, phone }),
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'No pudimos continuar al pago.')
      setCheckoutUrl(data.url)
      if (window.self !== window.top) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos continuar al pago.')
    } finally {
      setPending(false)
    }
  }

  if (checkoutUrl) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-pretty text-slate-600">
          Listo, guardamos tu WhatsApp. Si Mercado Pago no se abrió solo, continúa aquí:
        </p>
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className={PRIMARY_BUTTON}>
          <ExternalLink className="h-5 w-5 shrink-0" aria-hidden="true" />
          Ir a Mercado Pago
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-800">
          Número de WhatsApp
        </label>
        <div className="flex min-h-12 items-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-white transition-colors focus-within:border-[#25D366] has-aria-invalid:border-red-400">
          <span className="flex h-full items-center border-r border-slate-200 bg-slate-50 px-3 text-base font-medium text-slate-600">
            +52
          </span>
          <input
            id={inputId}
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            autoFocus
            required
            maxLength={20}
            placeholder="55 1234 5678"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="min-h-11 w-full bg-transparent px-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : (
          <p className="text-xs text-pretty text-slate-500">
            Aquí activamos tu plan y te enviamos el reporte semanal de avance.
          </p>
        )}
      </div>
      <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
        {pending ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
        )}
        {pending ? 'Preparando pago…' : 'Continuar al pago seguro'}
      </button>
      <p className="text-center text-xs text-slate-500">Pago con Mercado Pago • Cancela cuando quieras</p>
    </form>
  )
}

export function CheckoutButton({
  plan,
  planName,
  price,
  label,
  featured = false,
}: {
  plan: PaidPlanId
  planName: string
  price: string
  label: string
  featured?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={featured ? PRIMARY_BUTTON : SECONDARY_BUTTON}
      >
        <CreditCard className="h-5 w-5 shrink-0" aria-hidden="true" />
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`${planName} · ${price}`}
        description="Para activar tu plan necesitamos tu número de WhatsApp."
      >
        {open ? <CheckoutForm plan={plan} /> : null}
      </Modal>
    </>
  )
}
