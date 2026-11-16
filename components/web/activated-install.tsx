'use client'

import { Check, Download } from 'lucide-react'
import { InstallGuideDialog } from '@/components/campaign/install-guide-dialog'
import { useInstallAndShare } from '@/components/campaign/use-install-share'

export function ActivatedInstall() {
  const { installed, platform, dialogRef, canPromptInstall, openGuide, nativeInstall } = useInstallAndShare()

  return (
    <div className="flex flex-col gap-2 border-t border-emerald-100 pt-3">
      <p className="text-sm leading-relaxed text-pretty text-slate-700">
        Ten a PpGrillo a un toque: agrégalo a la pantalla de inicio de tu celular o computadora.
      </p>
      <button
        type="button"
        onClick={openGuide}
        disabled={installed}
        aria-haspopup="dialog"
        className="flex h-10 w-fit items-center gap-2 rounded-full bg-[#128C7E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0f7a6e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] disabled:bg-emerald-100 disabled:text-[#128C7E]"
      >
        {installed ? (
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        {installed ? 'Ya está en tu inicio' : 'Ver cómo instalarlo'}
      </button>
      <InstallGuideDialog
        ref={dialogRef}
        platform={platform}
        canPromptInstall={canPromptInstall}
        onNativeInstall={nativeInstall}
      />
    </div>
  )
}
