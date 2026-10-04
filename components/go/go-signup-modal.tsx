'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { signInAnonymously } from 'firebase/auth'
import { X } from 'lucide-react'
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { trackMetaEvent } from '@/lib/meta-pixel'
import { PpGrilloWordmark } from '@/components/app/brand-mark'
import { registerZeroFrictionTrial } from '@/components/app/user-profile'
import { SignupModalContext } from '@/components/estudiantes/signup-modal'
import { GoSignupForm, type GoSignupDetails } from './go-signup-form'

export function GoSignupModalProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [formKey, setFormKey] = useState(0)
  const router = useRouter()

  const open = useCallback(() => {
    setFormKey((k) => k + 1)
    dialogRef.current?.showModal()
  }, [])

  async function register(details: GoSignupDetails) {
    if (!isFirebaseConfigured) throw new Error('Firebase no está configurado.')
    const auth = firebaseAuth()
    const user = auth.currentUser ?? (await signInAnonymously(auth)).user
    await registerZeroFrictionTrial(user.uid, details)
    trackMetaEvent('Lead', {
      content_name: 'Registro Cero Friccion /go',
      value: 0.0,
      currency: 'MXN',
    })
    router.push('/app')
  }

  return (
    <SignupModalContext.Provider value={open}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="go-signup-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close()
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[2rem] border border-slate-200 bg-card p-0 shadow-2xl shadow-slate-900/20 backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
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
            <h2
              id="go-signup-title"
              className="text-balance font-display text-2xl font-extrabold tracking-tight text-slate-900"
            >
              Activa tus 14 días gratis al instante
            </h2>
            <p className="text-pretty text-sm font-medium leading-relaxed text-slate-500">
              Sin teléfono • Sin tarjeta bancaria • Acceso inmediato
            </p>
          </div>

          <div className="mt-7">
            <GoSignupForm key={formKey} onSubmit={register} />
          </div>
        </div>
      </dialog>
    </SignupModalContext.Provider>
  )
}
