'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { BrandIdentity } from '@/components/brand-identity'
import { WHATSAPP_RETURNING_USER_URL } from '@/lib/whatsapp'

const REDIRECT_SECONDS = 5

export function LegacyTransition() {
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (cancelled) return
    if (secondsLeft <= 0) {
      window.location.href = WHATSAPP_RETURNING_USER_URL
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, cancelled])

  const progress = ((REDIRECT_SECONDS - secondsLeft) / REDIRECT_SECONDS) * 100

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-5 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <BrandIdentity />

        <div className="flex w-full flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-[#128C7E]">
            <MessageCircle className="size-7" aria-hidden="true" />
          </span>

          <h1 className="font-display text-2xl font-extrabold leading-tight text-balance text-slate-900 sm:text-3xl">
            PpGrillo ahora te acompaña directamente en WhatsApp.
          </h1>

          <p className="text-base leading-relaxed text-pretty text-slate-600">
            Ya no necesitas iniciar sesión, recordar contraseñas ni entrar a la web. Todo tu
            acompañamiento y tus días de prueba continúan en tu celular.
          </p>

          <a
            href={WHATSAPP_RETURNING_USER_URL}
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-lg font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            Abrir mi tutor en WhatsApp
          </a>

          {cancelled ? (
            <p className="text-sm text-slate-500">Redirección automática cancelada.</p>
          ) : (
            <div className="flex w-full flex-col items-center gap-2">
              <p className="text-sm text-slate-600" aria-live="polite">
                Te llevaremos a WhatsApp en{' '}
                <span className="font-bold tabular-nums text-slate-900">{secondsLeft}</span>{' '}
                {secondsLeft === 1 ? 'segundo' : 'segundos'}…
              </p>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Tiempo para redirigir a WhatsApp"
                aria-valuemin={0}
                aria-valuemax={REDIRECT_SECONDS}
                aria-valuenow={REDIRECT_SECONDS - secondsLeft}
              >
                <div
                  className="h-full rounded-full bg-[#25D366] transition-[width] duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setCancelled(true)}
                className="text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-slate-700"
              >
                Quedarme aquí
              </button>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="text-base font-semibold text-[#128C7E] underline-offset-4 hover:underline"
        >
          {'← Ir a la página principal'}
        </Link>
      </div>
    </main>
  )
}
