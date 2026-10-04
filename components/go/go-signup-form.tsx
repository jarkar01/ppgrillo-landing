'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, GraduationCap, KeyRound, Loader2, ShieldCheck, User } from 'lucide-react'
import { isValidPin } from '@/components/app/user-profile'
import type { StudentProfile } from '@/components/app/types'

type Grade = NonNullable<StudentProfile['grade']>

export type GoSignupDetails = { studentName: string; grade: Grade; pin: string }

const GRADES: Grade[] = ['Primaria', 'Secundaria', 'Preparatoria']

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20'

const labelClass = 'flex items-center gap-2 text-sm font-semibold text-slate-700'

export function GoSignupForm({ onSubmit }: { onSubmit: (details: GoSignupDetails) => Promise<void> }) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<Grade | ''>('')
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameOk = name.trim().length >= 3
  const pinOk = isValidPin(pin)
  const canSubmit = nameOk && grade !== '' && pinOk && !saving
  const showPinHint = pin.length > 0 && !pinOk

  async function submit() {
    if (!canSubmit || !grade) return
    setError(null)
    setSaving(true)
    try {
      await onSubmit({ studentName: name.trim(), grade, pin })
    } catch (err) {
      console.error('[PpGrillo] No se pudo activar la prueba /go:', err)
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
        <label htmlFor="go-name" className={labelClass}>
          <User className="h-4 w-4 text-primary" aria-hidden="true" />
          Nombre del estudiante
        </label>
        <input
          id="go-name"
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
        <label htmlFor="go-grade" className={labelClass}>
          <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
          Grado escolar
        </label>
        <select
          id="go-grade"
          name="grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value as Grade)}
          className={`${inputClass} appearance-none bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-11 ${grade === '' ? 'text-slate-400' : ''}`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
          required
        >
          <option value="" disabled>
            Elige su nivel
          </option>
          {GRADES.map((g) => (
            <option key={g} value={g} className="text-slate-800">
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="go-pin" className={labelClass}>
          <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
          Elige un PIN de 4 dígitos
        </label>
        <input
          id="go-pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          enterKeyHint="go"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="••••"
          aria-invalid={showPinHint}
          aria-describedby="go-pin-hint"
          className={`${inputClass} text-center font-mono text-2xl tracking-[0.75em] placeholder:tracking-[0.75em]`}
          required
        />
        <p
          id="go-pin-hint"
          className={showPinHint ? 'text-xs font-medium text-red-600' : 'text-xs text-slate-400'}
        >
          {showPinHint ? `Faltan ${4 - pin.length} dígitos.` : 'Tu clave para entrar fácil a tu tutor.'}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-4 text-base font-bold text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Activando…
          </>
        ) : (
          <>
            Comenzar ahora
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </>
        )}
      </button>

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
