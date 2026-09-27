'use client'

import { useEffect, useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'ppgrillo:install-dismissed'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIOS() {
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

export function InstallPrompt() {
  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return

    if (isIOS()) {
      setPlatform('ios')
      return
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setPlatform('android')
    }
    function onInstalled() {
      setPlatform(null)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setPlatform(null)
    setShowIosHelp(false)
  }

  async function install() {
    if (platform === 'ios') {
      setShowIosHelp(true)
      return
    }
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    if (outcome === 'accepted') setPlatform(null)
  }

  if (!platform) return null

  return (
    <>
      <div
        role="region"
        aria-label="Instalar PpGrillo"
        className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.5rem)] z-40 flex items-center gap-3 rounded-2xl border border-slate-200 bg-card p-3 shadow-lg shadow-slate-900/10 animate-in fade-in slide-in-from-top-2 md:hidden"
      >
        <img src="/icons/icon-192.png" alt="" className="h-10 w-10 shrink-0 rounded-xl" />
        <p className="flex-1 text-sm font-medium leading-snug text-slate-800 text-pretty">
          Instala PpGrillo en tu celular para acceder en 1 toque
        </p>
        <button
          type="button"
          onClick={install}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground active:scale-95"
        >
          {platform === 'ios' ? (
            'Cómo instalar'
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden="true" />
              Instalar
            </>
          )}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar aviso de instalación"
          className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {showIosHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-xl animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="ios-install-title" className="font-display text-lg font-bold text-slate-900">
                Agrega PpGrillo a tu inicio
              </h2>
              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                aria-label="Cerrar instrucciones"
                className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-slate-700">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Share className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <strong>1.</strong> Toca el botón <strong>Compartir</strong> (cuadrado con flecha) en la barra de Safari.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SquarePlus className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <strong>2.</strong> Selecciona <strong>{"'Agregar a pantalla de inicio'"}</strong>.
                </span>
              </li>
            </ol>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Ahora no
              </button>
              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
