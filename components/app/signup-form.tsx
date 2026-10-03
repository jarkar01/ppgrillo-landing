'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2, Lock, MessageCircle, ShieldCheck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isValidPhone, normalizePhone } from './user-profile'

type SignupFormProps = {
  initialError?: string | null
  nameLabel?: string
  submitLabel?: string
  trustNote?: string
  onSubmit: (studentName: string, phone: string) => Promise<void>
}

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20'

export function SignupForm({
  initialError,
  nameLabel = 'Nombre completo',
  submitLabel = 'Entrar a mi tutor',
  trustNote,
  onSubmit,
}: SignupFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(initialError ?? null)

  const nameOk = name.trim().length >= 3
  const phoneOk = isValidPhone(phone)
  const showPhoneHint = phone.length > 0 && !phoneOk

  async function submit() {
    if (!nameOk || !phoneOk || saving) return
    setError(null)
    setSaving(true)
    try {
      await onSubmit(name.trim(), phone)
    } catch (err) {
      console.error('[PpGrillo] No se pudo activar la prueba:', err)
      setError('No pudimos activar tu prueba. Revisa tu conexión e intenta de nuevo.')
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <User className="h-4 w-4 text-primary" aria-hidden="true" />
          {nameLabel}
        </label>
        <input
          id="fullName"
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Sofía Ramírez"
          className={inputClass}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
          WhatsApp (10 dígitos)
        </label>
        <div className="flex items-stretch gap-2">
          <span className="flex items-center rounded-2xl border border-slate-200 bg-muted px-3 text-base font-semibold text-slate-600">
            +52
          </span>
          <input
            id="whatsapp"
            name="tel"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            enterKeyHint="go"
            maxLength={14}
            value={phone}
            onChange={(e) => setPhone(normalizePhone(e.target.value))}
            placeholder="6141234567"
            aria-invalid={showPhoneHint}
            aria-describedby="whatsapp-hint"
            className={inputClass}
            required
          />
        </div>
        <p
          id="whatsapp-hint"
          className={showPhoneHint ? 'text-xs font-medium text-red-600' : 'text-xs text-slate-400'}
        >
          {showPhoneHint
            ? `Faltan ${10 - phone.length} dígitos.`
            : 'Lo usamos para identificar tu cuenta y enviarte avances.'}
        </p>
        {trustNote && (
          <p className="flex items-start gap-2 rounded-2xl bg-accent px-3.5 py-2.5 text-xs font-medium leading-relaxed text-slate-700">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>{trustNote}</span>
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!nameOk || !phoneOk || saving}
        className="h-auto min-h-14 w-full gap-2 whitespace-normal rounded-full px-5 py-4 text-base font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Activando…
          </>
        ) : (
          <>
            {submitLabel}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </>
        )}
      </Button>

      <p className="flex items-start justify-center gap-1.5 text-center text-xs leading-relaxed text-slate-400">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Al continuar aceptas el{' '}
          <Link href="/privacidad" className="underline underline-offset-2">
            Aviso de Privacidad
          </Link>{' '}
          y los{' '}
          <Link href="/terminos" className="underline underline-offset-2">
            Términos
          </Link>
          .
        </span>
      </p>
    </form>
  )
}
