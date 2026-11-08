"use client";

import { Check, Download, Share2 } from "lucide-react";
import { InstallGuideDialog } from "./install-guide-dialog";
import { useInstallAndShare } from "./use-install-share";

export function QuickContactActions() {
  const { copied, installed, platform, dialogRef, canPromptInstall, share, openGuide, nativeInstall } =
    useInstallAndShare();

  return (
    <section
      aria-labelledby="quick-contact-title"
      className="mx-auto w-full max-w-md px-4 py-10 sm:max-w-2xl sm:py-14"
    >
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-emerald-100 bg-emerald-50/50 px-5 py-8 text-center sm:px-10">
        <div className="flex flex-col items-center gap-2">
          <h2
            id="quick-contact-title"
            className="font-display text-2xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-3xl"
          >
            Ten a PpGrillo a un toque
          </h2>
          <p className="max-w-md text-base leading-relaxed text-pretty text-slate-600">
            Agrega PpGrillo a la pantalla de inicio de tu celular. Al abrirlo desde su ícono, te recordará y entrarás directo al chat de tareas.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={openGuide}
            disabled={installed}
            aria-haspopup="dialog"
            className="flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 active:scale-[0.99] disabled:cursor-default disabled:bg-emerald-700/80"
          >
            {installed ? (
              <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
            ) : (
              <Download className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            {installed ? "PpGrillo ya está instalado" : "Agregar a la pantalla de inicio"}
          </button>
          <button
            type="button"
            onClick={share}
            className="flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:scale-[0.99]"
          >
            {copied ? (
              <Check className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : (
              <Share2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            {copied ? "Enlace copiado" : "Compartir PpGrillo"}
          </button>
        </div>

        <p className="sr-only" aria-live="polite">
          {copied ? "Enlace de PpGrillo copiado al portapapeles." : ""}
        </p>
      </div>

      <InstallGuideDialog
        ref={dialogRef}
        platform={platform}
        canPromptInstall={canPromptInstall}
        onNativeInstall={nativeInstall}
      />
    </section>
  );
}
