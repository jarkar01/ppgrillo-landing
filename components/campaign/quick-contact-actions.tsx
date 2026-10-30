"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

const SHARE_DATA = {
  title: "PpGrillo",
  text: "Conoce PpGrillo: tu tutor que te ayuda a resolver tus tareas paso a paso.",
  url: "https://ppgrillo.io",
};

export function QuickContactActions() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(SHARE_DATA);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${SHARE_DATA.text} ${SHARE_DATA.url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copia este enlace para compartir PpGrillo:", SHARE_DATA.url);
    }
  }

  return (
    <section
      aria-labelledby="quick-contact-title"
      className="mx-auto w-full max-w-md px-4 py-10 sm:max-w-2xl sm:py-14"
    >
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-emerald-100 bg-emerald-50/50 px-5 py-8 text-center sm:px-10">
        <div className="flex flex-col items-center gap-2">
          <h2
            id="quick-contact-title"
            className="font-display text-2xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-3xl"
          >
            Ten a PpGrillo a un toque
          </h2>
          <p className="max-w-md text-base leading-relaxed text-pretty text-slate-600">
            Comparte PpGrillo con tus amigos o tu familia y guarda nuestro contacto para encontrarnos rápido cuando llegue la tarea.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleShare}
            className="flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 active:scale-[0.99]"
          >
            {copied ? (
              <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
            ) : (
              <Share2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            {copied ? "Enlace copiado" : "Compartir PpGrillo"}
          </button>
          <a
            href="/ppgrillo.vcf"
            download="PpGrillo.vcf"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:scale-[0.99]"
          >
            <span aria-hidden="true">📇</span>
            Guardar a PpGrillo en tus contactos
          </a>
        </div>

        <p className="text-sm text-pretty text-slate-500" aria-live="polite">
          {copied
            ? "Pega el enlace en WhatsApp o en cualquier red para compartirlo."
            : "Al tocar el enlace del contacto guardado se abre la app de PpGrillo para seguir con tus tareas y tu historial."}
        </p>
      </div>
    </section>
  );
}
