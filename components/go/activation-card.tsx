'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInAnonymously } from 'firebase/auth'
import { ArrowRight, GraduationCap, Loader2, User } from 'lucide-react'
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { trackMetaEvent } from '@/lib/meta-pixel'
import { registerZeroFrictionTrial } from '@/components/app/user-profile'
import type { StudentProfile } from '@/components/app/types'

type Grade = NonNullable<StudentProfile['grade']>

const GRADE_OPTIONS: { value: Grade; label: string }[] = [
  { value: 'Primaria', label: '🎒 Primaria (1º a 6º)' },
  { value: 'Secundaria', label: '📐 Secundaria (1º a 3º)' },
]

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'

const labelClass = 'flex items-center gap-2 text-sm font-semibold text-slate-700'

export function ActivationCard() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<Grade | ''>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim().length >= 2 && grade !== '' && !saving

  async function activate() {
    if (!canSubmit || !grade) return
    setError(null)
    setSaving(true)
    try {
      if (!isFirebaseConfigured) throw new Error('Firebase no está configurado.')
      const auth = firebaseAuth()
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user
      await registerZeroFrictionTrial(
        user.uid,
        { studentName: name.trim(), grade },
        'experiment_go_interactive',
      )
      trackMetaEvent('Lead', {
        content_name: 'Registro Interactivo /go',
        value: 0.0,
        currency: 'MXN',
      })
      router.push('/app')
    } catch (err) {
      console.error('[PpGrillo] No se pudo activar la prueba /go:', err)
      setError('No pudimos activar tu prueba. Revisa tu conexión e intenta de nuevo.')
      setSaving(false)
    }
  }

  return (
    <section
      id="activar"
      aria-labelledby="activation-title"
      className="scroll-mt-6 rounded-[2rem] border-2 border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-6 shadow-xl shadow-emerald-900/10 sm:p-8"
    >
      <h2
        id="activation-title"
        className="text-balance text-center font-display text-2xl font-extrabold leading-tight tracking-tight text-slate-900"
      >
        Tu hijo puede aprender con esta misma paciencia hoy.
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          activate()
        }}
        className="mt-6 flex flex-col gap-5"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="activation-name" className={labelClass}>
            <User className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Nombre de tu hijo
          </label>
          <input
            id="activation-name"
            name="name"
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="next"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Sofía"
            className={inputClass}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="activation-grade" className={labelClass}>
            <GraduationCap className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Nivel escolar
          </label>
          <select
            id="activation-grade"
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
            {GRADE_OPTIONS.map((g) => (
              <option key={g.value} value={g.value} className="text-slate-800">
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-4 text-lg font-extrabold text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Activando…
            </>
          ) : (
            <>
              Comenzar 14 días gratis
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </button>

        <p className="text-pretty text-center text-xs leading-relaxed text-slate-500">
          14 días gratis sin tarjeta • Después solo $25 MXN/mes si decides continuar • Cancela en cualquier momento
        </p>
      </form>
    </section>
  )
}
