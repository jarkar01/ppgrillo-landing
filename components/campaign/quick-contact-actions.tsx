"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, Share2 } from "lucide-react";
import { InstallGuideDialog, type InstallPlatform, type InstallPromptEvent } from "./install-guide-dialog";

const SHARE_DATA = {
  title: "PpGrillo",
  text: "Conoce PpGrillo: tu tutor que te ayuda a resolver tus tareas paso a paso.",
  url: "https://ppgrillo.io",
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function detectPlatform(): InstallPlatform {
  const ua = navigator.userAgent;
  const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || isIPadOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

export function QuickContactActions() {
  const [copied, setCopied] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("desktop");
  const dialogRef = useRef<HTMLDialogElement>(null);

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
      dialogRef.current?.close();
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

  function openGuide() {
    setPlatform(detectPlatform());
    dialogRef.current?.showModal();
  }

  async function handleNativeInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "accepted") {
      setInstalled(true);
      dialogRef.current?.close();
    }
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
      </div>

      <InstallGuideDialog
        ref={dialogRef}
        platform={platform}
        canPromptInstall={installEvent !== null}
        onNativeInstall={handleNativeInstall}
      />
    </section>
  );
}
