"use client";

import { forwardRef, type ReactNode } from "react";
import { Download, Laptop, MoreVertical, PlusSquare, Share, Smartphone, X } from "lucide-react";

export type InstallPlatform = "ios" | "android" | "desktop";

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Step = { icon: ReactNode; content: ReactNode };

const iconClass = "h-5 w-5 text-emerald-700";

function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-slate-900">{children}</strong>;
}

const GUIDES: Record<InstallPlatform, { label: string; icon: ReactNode; intro: string; steps: Step[] }> = {
  ios: {
    label: "iPhone / iPad",
    icon: <Smartphone className="h-4 w-4" aria-hidden="true" />,
    intro: "Para tener a PpGrillo a la mano:",
    steps: [
      {
        icon: <Share className={iconClass} aria-hidden="true" />,
        content: (
          <>
            Toca el botón <Strong>Compartir</Strong>{" "}
            <Share className="inline h-4 w-4 -translate-y-0.5 text-slate-700" aria-label="(ícono de compartir)" /> en tu
            navegador. En Safari está en la barra inferior.
          </>
        ),
      },
      {
        icon: <PlusSquare className={iconClass} aria-hidden="true" />,
        content: (
          <>
            Desliza y selecciona <Strong>“Agregar a la pantalla de inicio”</Strong>. Después toca{" "}
            <Strong>Agregar</Strong>.
          </>
        ),
      },
    ],
  },
  android: {
    label: "Android",
    icon: <Smartphone className="h-4 w-4" aria-hidden="true" />,
    intro: "Para tener a PpGrillo a la mano:",
    steps: [
      {
        icon: <MoreVertical className={iconClass} aria-hidden="true" />,
        content: (
          <>
            Toca los <Strong>tres puntos</Strong>{" "}
            <MoreVertical className="inline h-4 w-4 -translate-y-0.5 text-slate-700" aria-label="(ícono de menú)" /> en la
            esquina superior derecha de Chrome.
          </>
        ),
      },
      {
        icon: <Download className={iconClass} aria-hidden="true" />,
        content: (
          <>
            Selecciona <Strong>“Instalar aplicación”</Strong> (o <Strong>“Agregar a la pantalla de inicio”</Strong>) y
            confirma.
          </>
        ),
      },
    ],
  },
  desktop: {
    label: "Computadora",
    icon: <Laptop className="h-4 w-4" aria-hidden="true" />,
    intro: "Para tener a PpGrillo a la mano en tu computadora:",
    steps: [
      {
        icon: <Download className={iconClass} aria-hidden="true" />,
        content: (
          <>
            Busca el <Strong>ícono de instalar</Strong> al final de la <Strong>barra de direcciones</Strong> de tu
            navegador (Chrome o Edge) y haz clic en él.
          </>
        ),
      },
      {
        icon: <MoreVertical className={iconClass} aria-hidden="true" />,
        content: (
          <>
            Si no lo ves, abre el menú del navegador y elige <Strong>“Instalar PpGrillo”</Strong>. En Safari para Mac usa{" "}
            <Strong>Archivo → Agregar al Dock</Strong>.
          </>
        ),
      },
    ],
  },
};

type Props = {
  platform: InstallPlatform;
  canPromptInstall: boolean;
  onNativeInstall: () => void;
};

export const InstallGuideDialog = forwardRef<HTMLDialogElement, Props>(function InstallGuideDialog(
  { platform, canPromptInstall, onNativeInstall },
  ref,
) {
  const guide = GUIDES[platform];
  const showNativeButton = canPromptInstall && platform !== "ios";

  return (
    <dialog
      ref={ref}
      aria-labelledby="install-guide-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-0 text-left shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {guide.icon}
              {guide.label}
            </span>
            <h3 id="install-guide-title" className="font-display text-xl font-extrabold tracking-tight text-slate-900">
              Agrega PpGrillo a tu pantalla de inicio
            </h3>
          </div>
          <form method="dialog">
            <button
              type="submit"
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </div>

        {showNativeButton && (
          <button
            type="button"
            onClick={onNativeInstall}
            className="flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
            Instalar ahora
          </button>
        )}

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-slate-600">
            {showNativeButton ? "O hazlo manualmente:" : guide.intro}
          </p>
          <ol className="flex flex-col gap-3">
            {guide.steps.map((step, index) => (
              <li key={index} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  {step.icon}
                </span>
                <p className="text-sm leading-relaxed text-slate-700">
                  <span className="font-bold text-emerald-700">{index + 1}. </span>
                  {step.content}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-xs leading-relaxed text-slate-500">
          Al abrir PpGrillo desde su ícono, recordará tu nombre y entrarás directo al chat de tareas.
        </p>

        <form method="dialog">
          <button
            type="submit"
            className="w-full rounded-full border-2 border-slate-200 px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-slate-400"
          >
            Entendido
          </button>
        </form>
      </div>
    </dialog>
  );
});
