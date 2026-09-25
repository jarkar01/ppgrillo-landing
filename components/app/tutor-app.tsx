'use client'

import { useState } from 'react'
import { AuthScreen } from './auth-screen'
import { Onboarding } from './onboarding'
import { AppShell } from './app-shell'
import type { StudentProfile } from './types'

type Step = 'auth' | 'onboarding' | 'app'

export function TutorApp() {
  const [step, setStep] = useState<Step>('auth')
  const [profile, setProfile] = useState<StudentProfile | null>(null)

  if (step === 'auth') {
    return <AuthScreen onAuthed={() => setStep('onboarding')} />
  }

  if (step === 'onboarding' || !profile) {
    return (
      <Onboarding
        onComplete={(p) => {
          setProfile(p)
          setStep('app')
        }}
      />
    )
  }

  return (
    <AppShell
      profile={profile}
      onLogout={() => {
        setProfile(null)
        setStep('auth')
      }}
    />
  )
}
