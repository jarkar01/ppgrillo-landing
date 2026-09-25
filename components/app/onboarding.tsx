'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { User, GraduationCap, MessageCircle } from 'lucide-react'
import { PpGrilloWordmark } from './brand-mark'
import type { StudentProfile } from './types'

const grades = ['Primaria', 'Secundaria', 'Preparatoria'] as const

export function Onboarding({ onComplete }: { onComplete: (profile: StudentProfile) => void }) {
  const [studentName, setStudentName] = useState('')
  const [grade, setGrade] = useState<StudentProfile['grade'] | ''>('')
  const [whatsapp, setWhatsapp] = useState('')

  const valid = studentName.trim() && grade && whatsapp.trim().length >= 8

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(37,211,102,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] border border-slate-200 bg-card p-8 shadow-xl shadow-emerald-600/10 sm:p-10">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Casi listos
            </span>
            <h1 className="mt-2 text-balance font-display text-2xl font-extrabold tracking-tight text-slate-900">
              Personaliza la tutoría
            </h1>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-500">
              Solo 3 datos para que <PpGrilloWordmark className="text-sm" /> acompañe mejor a tu hijo.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (valid) onComplete({ studentName: studentName.trim(), grade: grade as StudentProfile['grade'], whatsapp: whatsapp.trim() })
            }}
            className="mt-8 space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="studentName" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <User className="h-4 w-4 text-primary" />
                Nombre del alumno
              </label>
              <input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ej. Sofía"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <GraduationCap className="h-4 w-4 text-primary" />
                Grado escolar
              </span>
              <div className="grid grid-cols-3 gap-2">
                {grades.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    aria-pressed={grade === g}
                    className={`rounded-2xl border px-2 py-3 text-[13px] font-semibold transition-all ${
                      grade === g
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:bg-accent'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MessageCircle className="h-4 w-4 text-primary" />
                WhatsApp del tutor
              </label>
              <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ej. 55 1234 5678"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-slate-400">Para enviarte los reportes semanales de progreso.</p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!valid}
              className="h-auto w-full rounded-full py-4 text-base font-bold disabled:opacity-50"
            >
              Comenzar tutoría con PpGrillo
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
