'use client'

import { useEffect, useState } from 'react'
import { Check, Compass, Copy, Download, X } from 'lucide-react'
import { IosInstallGuide } from './ios-install-guide'

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

function isIOSSafari() {
  const ua = navigator.userAgent
  const otherBrowserOrWebView =
    /CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|WhatsApp|Instagram|FBAN|FBAV|Line\/|Twitter|TikTok|Snapchat/i
  return /Safari/i.test(ua) && !otherBrowserOrWebView.test(ua)
}

export function InstallPrompt() {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'ios-other' | null>(null)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return

    if (isIOS()) {
      setPlatform(isIOSSafari() ? 'ios' : 'ios-other')
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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/app')
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {}
  }

  if (!platform) return null

  if (platform === 'ios-other') {
    return (
      <div
        role="region"
        aria-label="Abrir en Safari"
        className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.5rem)] z-40 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-card p-4 shadow-lg shadow-slate-900/10 animate-in fade-in slide-in-from-top-2 md:hidden"
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="flex-1 text-sm font-medium leading-relaxed text-slate-800 text-pretty">
            Para agregar la app a tu celular, abre esta página en <strong>Safari</strong> (icono de la brújula).
          </p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Cerrar aviso"
            className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Enlace copiado. Pégalo en Safari
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copiar enlace
            </>
          )}
        </button>
      </div>
    )
  }

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

      {showIosHelp && <IosInstallGuide onClose={() => setShowIosHelp(false)} onDismiss={dismiss} />}
    </>
  )
}
