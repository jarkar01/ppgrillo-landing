'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { Loader2 } from 'lucide-react'
import { firebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { AuthScreen } from './auth-screen'
import { Onboarding } from './onboarding'
import { AppShell } from './app-shell'
import { loadCompletedProfile, saveOnboarding } from './user-profile'
import type { StudentProfile } from './types'

type Step = 'loading' | 'auth' | 'onboarding' | 'app'

export function TutorApp() {
  const [step, setStep] = useState<Step>(isFirebaseConfigured ? 'loading' : 'auth')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(firebaseAuth(), async (authUser) => {
      setUser(authUser)
      if (!authUser) {
        setProfile(null)
        setStep('auth')
        return
      }
      setStep('loading')
      try {
        const saved = await loadCompletedProfile(authUser.uid)
        setProfile(saved)
        setStep(saved ? 'app' : 'onboarding')
      } catch (err) {
        console.error('[PpGrillo] No se pudo leer el perfil:', err)
        setLoadError('No pudimos cargar tu perfil. Intenta de nuevo.')
        setStep('auth')
      }
    })
  }, [])

  if (step === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Cargando tu cuenta…</span>
      </div>
    )
  }

  if (step === 'auth' || !user) {
    return <AuthScreen initialError={loadError} />
  }

  if (step === 'onboarding' || !profile) {
    return (
      <Onboarding
        onComplete={async (p) => {
          const saved = await saveOnboarding(user, p)
          setProfile(saved)
          setStep('app')
        }}
      />
    )
  }

  return <AppShell profile={profile} onLogout={() => signOut(firebaseAuth())} />
}
