'use client'

import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { Button } from '@/components/ui/button'
import { Mail, ShieldCheck, ArrowLeft, Lock, Loader2 } from 'lucide-react'
import { firebaseAuth, googleProvider, isFirebaseConfigured } from '@/lib/firebase'
import { GoogleG, PpGrilloWordmark } from './brand-mark'

function authErrorMessage(err: unknown): string {
  const code = err instanceof FirebaseError ? err.code : ''
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Cerraste la ventana de Google antes de terminar.'
    case 'auth/popup-blocked':
      return 'Tu navegador bloqueó la ventana de Google. Permite ventanas emergentes e intenta de nuevo.'
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado en Firebase Authentication.'
    case 'auth/email-already-in-use':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Correo o contraseña incorrectos.'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.'
    case 'auth/invalid-email':
      return 'El correo no es válido.'
    default:
      return 'No pudimos iniciar sesión. Intenta de nuevo.'
  }
}

export function AuthScreen({ initialError }: { initialError?: string | null }) {
  const [emailMode, setEmailMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured ? (initialError ?? null) : 'El inicio de sesión aún no está configurado.',
  )

  async function run(action: () => Promise<unknown>) {
    setError(null)
    setPending(true)
    try {
      await action()
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  const signInWithGoogle = () => run(() => signInWithPopup(firebaseAuth(), googleProvider))

  const signInWithEmail = () =>
    run(async () => {
      const auth = firebaseAuth()
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      } catch (err) {
        if (err instanceof FirebaseError && err.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, email.trim(), password)
          return
        }
        throw err
      }
    })

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(37,211,102,0.12),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </a>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-card p-8 shadow-xl shadow-emerald-600/10 sm:p-10">
          <div className="text-center">
            <PpGrilloWordmark className="text-3xl" />
            <h1 className="mt-5 text-balance font-display text-2xl font-extrabold tracking-tight text-slate-900">
              Bienvenido a la tutoría
            </h1>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-500">
              Ingresa para que tu hijo empiece a aprender a pensar, paso a paso.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Button
              onClick={signInWithGoogle}
              disabled={pending || !isFirebaseConfigured}
              size="lg"
              className="h-auto w-full rounded-full border border-slate-200 bg-white py-4 text-base font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <GoogleG className="h-5 w-5 shrink-0" />
              )}
              Continuar con Google
            </Button>

            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            {!emailMode ? (
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <button
                  type="button"
                  onClick={() => setEmailMode(true)}
                  className="text-xs font-semibold text-slate-500 transition-colors hover:text-primary"
                >
                  o regístrate con tu correo
                </button>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (email.trim() && password) signInWithEmail()
                }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold text-slate-400">o con tu correo</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña (mín. 6 caracteres)"
                    aria-label="Contraseña"
                    className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={pending || !isFirebaseConfigured}
                  className="h-auto w-full rounded-full py-3.5 text-base font-semibold"
                >
                  Continuar
                </Button>
              </form>
            )}
          </div>

          <div className="mt-7 flex items-start gap-2.5 rounded-2xl bg-accent px-4 py-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-[13px] font-medium leading-snug text-accent-foreground">
              Tu prueba gratuita de 14 días comienza al iniciar sesión. Sin tarjeta bancaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
