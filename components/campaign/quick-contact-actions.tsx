"use client";

import { useEffect, useState } from "react";
import { Check, Download, MoreVertical, Share, Share2, Smartphone } from "lucide-react";

const SHARE_DATA = {
  title: "PpGrillo",
  text: "Conoce PpGrillo: tu tutor que te ayuda a resolver tus tareas paso a paso.",
  url: "https://ppgrillo.io",
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function QuickContactActions() {
  const [copied, setCopied] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    if ("serviceWorker" in navigator && window.self === window.top) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(SHARE_DATA);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(SHARE_DATA.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copia este enlace para compartir PpGrillo:", SHARE_DATA.url);
    }
  }

  async function handleInstall() {
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setInstallEvent(null);
      return;
    }
    setShowSteps((open) => !open);
  }

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
            onClick={handleInstall}
            disabled={installed}
            aria-expanded={installEvent || installed ? undefined : showSteps}
            aria-controls={installEvent || installed ? undefined : "install-steps"}
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
            onClick={handleShare}
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

        {!installed && (
          <div
            id="install-steps"
            className={`w-full flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-5 text-left ${
              showSteps || !installEvent ? "flex" : "hidden"
            }`}
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Smartphone className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              También puedes hacerlo desde el menú de tu navegador:
            </p>
            <ul className="flex flex-col gap-3 text-sm leading-relaxed text-slate-600">
              <li className="flex gap-3">
                <Share className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-slate-800">iPhone (Safari):</strong> toca el botón Compartir y elige{" "}
                  <strong className="font-semibold text-slate-800">“Agregar a la pantalla de inicio”</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <MoreVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-slate-800">Android o computadora (Chrome):</strong> abre el menú y elige{" "}
                  <strong className="font-semibold text-slate-800">“Instalar aplicación”</strong> o{" "}
                  <strong className="font-semibold text-slate-800">“Agregar a la pantalla de inicio”</strong>.
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
