'use client'

import { PpGrilloWordmark } from './brand-mark'
import { SignupForm } from './signup-form'

type QuickSignupProps = {
  initialError?: string | null
  onSubmit: (studentName: string, phone: string) => Promise<void>
}

export function QuickSignup({ initialError, onSubmit }: QuickSignupProps) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] border border-slate-200 bg-card p-7 shadow-xl shadow-emerald-600/10 sm:p-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <PpGrilloWordmark className="text-xl" />
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              Sin tarjeta · Sin contraseñas
            </span>
            <h1 className="text-balance font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Activa tus 14 días gratis con PpGrillo
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-slate-500">
              Solo 2 datos y entras directo a tu tutor.
            </p>
          </div>

          <div className="mt-8">
            <SignupForm initialError={initialError} onSubmit={onSubmit} />
          </div>
        </div>
      </div>
    </main>
  )
}
