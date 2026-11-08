'use client'

import { Check, Download, Share2 } from 'lucide-react'
import { InstallGuideDialog } from '@/components/campaign/install-guide-dialog'
import { useInstallAndShare } from '@/components/campaign/use-install-share'

const actionClass =
  'flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-[#128C7E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-slate-500'

export function ChatQuickActions() {
  const { copied, installed, platform, dialogRef, canPromptInstall, share, openGuide, nativeInstall } =
    useInstallAndShare()

  return (
    <nav
      aria-label="Acciones rápidas"
      className="flex items-center justify-center gap-1 px-4 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <button type="button" onClick={openGuide} disabled={installed} aria-haspopup="dialog" className={actionClass}>
        {installed ? (
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        {installed ? 'Ya está en tu inicio' : 'Agregar a la pantalla de inicio'}
      </button>
      <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
      <button type="button" onClick={share} className={actionClass}>
        {copied ? (
          <Check className="h-4 w-4 shrink-0 text-[#25D366]" aria-hidden="true" />
        ) : (
          <Share2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        {copied ? 'Enlace copiado' : 'Compartir PpGrillo'}
      </button>
      <p className="sr-only" aria-live="polite">
        {copied ? 'Enlace de PpGrillo copiado al portapapeles.' : ''}
      </p>

      <InstallGuideDialog
        ref={dialogRef}
        platform={platform}
        canPromptInstall={canPromptInstall}
        onNativeInstall={nativeInstall}
      />
    </nav>
  )
}
