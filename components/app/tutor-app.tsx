'use client'

import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { Loader2 } from 'lucide-react'
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { trackMetaEvent } from '@/lib/meta-pixel'
import { QuickSignup } from './quick-signup'
import { AppShell } from './app-shell'
import { clearStoredPhone, getStoredPhone, loadProfile, registerTrial } from './user-profile'
import type { StudentProfile } from './types'

type Step = 'loading' | 'signup' | 'app'

export function TutorApp() {
  const [step, setStep] = useState<Step>(isFirebaseConfigured ? 'loading' : 'signup')
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loadError, setLoadError] = useState<string | null>(
    isFirebaseConfigured ? null : 'El servicio no está disponible en este momento.',
  )
  const registering = useRef(false)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(firebaseAuth(), async (authUser) => {
      if (registering.current) return
      const phone = getStoredPhone()
      if (!authUser || !phone) {
        setProfile(null)
        setStep('signup')
        return
      }
      try {
        const saved = await loadProfile(authUser.uid, phone)
        setProfile(saved)
        setStep(saved ? 'app' : 'signup')
      } catch (err) {
        console.error('[PpGrillo] No se pudo leer el perfil:', err)
        setLoadError('No pudimos cargar tu cuenta. Vuelve a ingresar tus datos.')
        setStep('signup')
      }
    })
  }, [])

  async function activateTrial(studentName: string, phone: string) {
    registering.current = true
    try {
      const auth = firebaseAuth()
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user
      const saved = await registerTrial(user.uid, studentName, phone)
      trackMetaEvent('CompleteRegistration', {
        content_name: 'Prueba gratis 14 días',
        status: 'trial_started',
      })
      setProfile(saved)
      setStep('app')
    } finally {
      registering.current = false
    }
  }

  async function logout() {
    clearStoredPhone()
    setProfile(null)
    setStep('signup')
    await signOut(firebaseAuth())
  }

  if (step === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Cargando tu cuenta…</span>
      </div>
    )
  }

  if (step === 'signup' || !profile) {
    return <QuickSignup initialError={loadError} onSubmit={activateTrial} />
  }

  return <AppShell profile={profile} onLogout={logout} />
}
