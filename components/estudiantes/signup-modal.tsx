'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { signInAnonymously } from 'firebase/auth'
import { X } from 'lucide-react'
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { trackMetaEvent } from '@/lib/meta-pixel'
import { PpGrilloWordmark } from '@/components/app/brand-mark'
import { SignupForm } from '@/components/app/signup-form'
import { registerTrial } from '@/components/app/user-profile'

const SignupModalContext = createContext<(() => void) | null>(null)

export function useOpenSignup() {
  const open = useContext(SignupModalContext)
  if (!open) throw new Error('useOpenSignup debe usarse dentro de <SignupModalProvider>.')
  return open
}

type SignupModalProviderProps = {
  children: ReactNode
  category?: string
  title?: string
  subtitle?: string
  submitLabel?: string
}

export function SignupModalProvider({
  children,
  category = 'estudiantes',
  title = 'Activa tus 14 días gratis',
  subtitle = 'Solo tu nombre y tu WhatsApp. En segundos estás resolviendo tu tarea.',
  submitLabel = 'Empezar con mi tutor',
}: SignupModalProviderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [formKey, setFormKey] = useState(0)
  const router = useRouter()

  const open = useCallback(() => {
    setFormKey((k) => k + 1)
    dialogRef.current?.showModal()
  }, [])

  async function register(studentName: string, phone: string) {
    if (!isFirebaseConfigured) throw new Error('Firebase no está configurado.')
    const auth = firebaseAuth()
    const user = auth.currentUser ?? (await signInAnonymously(auth)).user
    await registerTrial(user.uid, studentName, phone)
    trackMetaEvent('Lead', {
      content_name: 'Prueba gratis 14 días',
      content_category: category,
    })
    router.push('/app')
  }

  return (
    <SignupModalContext.Provider value={open}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="student-signup-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close()
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[2rem] border border-slate-200 bg-card p-0 shadow-2xl shadow-slate-900/20 backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-7 sm:p-9">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-muted hover:text-slate-800"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="flex flex-col items-center gap-3 text-center">
            <PpGrilloWordmark className="text-xl" />
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              Sin tarjeta · Sin contraseñas
            </span>
            <h2
              id="student-signup-title"
              className="text-balance font-display text-2xl font-extrabold tracking-tight text-slate-900"
            >
              {title}
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-slate-500">{subtitle}</p>
          </div>

          <div className="mt-7">
            <SignupForm
              key={formKey}
              nameLabel="Nombre del estudiante"
              submitLabel={submitLabel}
              onSubmit={register}
            />
          </div>
        </div>
      </dialog>
    </SignupModalContext.Provider>
  )
}

export function SignupTrigger({ className, children }: { className?: string; children: ReactNode }) {
  const open = useOpenSignup()
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  )
}
