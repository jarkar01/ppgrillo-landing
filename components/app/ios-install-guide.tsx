'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Share, SquarePlus, X } from 'lucide-react'

function SafariBarVisual() {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="mx-auto h-2 w-24 rounded-full bg-slate-200" aria-hidden="true" />
      <div className="flex items-center justify-around rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
        <ChevronLeft className="h-6 w-6 text-slate-300" aria-hidden="true" />
        <ChevronRight className="h-6 w-6 text-slate-300" aria-hidden="true" />
        <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-4 ring-primary">
          <span className="absolute inset-0 animate-ping rounded-2xl ring-2 ring-primary/60" aria-hidden="true" />
          <Share className="h-8 w-8 text-primary" aria-hidden="true" />
        </span>
        <span className="h-6 w-6 rounded-md border-2 border-slate-300" aria-hidden="true" />
        <span className="flex h-6 w-6 items-center justify-center" aria-hidden="true">
          <span className="h-5 w-5 rounded-md border-2 border-slate-300" />
        </span>
      </div>
      <p className="text-center text-xs font-medium text-slate-500">Barra inferior de Safari</p>
    </div>
  )
}

function ShareSheetVisual() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-400">
        <span>Copiar</span>
        <span className="h-5 w-5 rounded border-2 border-slate-300" aria-hidden="true" />
      </div>
      <div className="flex items-center justify-between bg-primary/10 px-4 py-4 ring-4 ring-inset ring-primary">
        <span className="text-base font-bold text-slate-900">Agregar a inicio</span>
        <SquarePlus className="h-8 w-8 text-primary" aria-hidden="true" />
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-400">
        <span>Agregar marcador</span>
        <span className="h-5 w-5 rounded border-2 border-slate-300" aria-hidden="true" />
      </div>
    </div>
  )
}

function ConfirmVisual() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="text-sm text-slate-400">Cancelar</span>
        <span className="text-sm font-semibold text-slate-500">Agregar a inicio</span>
        <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-base font-bold text-primary ring-4 ring-primary">
          Agregar
        </span>
      </div>
      <div className="flex items-center gap-3 px-4 py-4">
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
        <span className="text-base font-semibold text-slate-800">PpGrillo</span>
      </div>
    </div>
  )
}

const STEPS = [
  {
    title: 'Toca Compartir',
    text: 'Es el cuadro con flecha hacia arriba, abajo en Safari.',
    Visual: SafariBarVisual,
  },
  {
    title: 'Toca "Agregar a inicio"',
    text: 'Desliza hacia abajo si no lo ves. Tiene un cuadro con +.',
    Visual: ShareSheetVisual,
  },
  {
    title: 'Toca "Agregar"',
    text: 'Arriba a la derecha. ¡Listo! PpGrillo queda en tu inicio.',
    Visual: ConfirmVisual,
  },
]

export function IosInstallGuide({ onClose, onDismiss }: { onClose: () => void; onDismiss: () => void }) {
  const [step, setStep] = useState(0)
  const { title, text, Visual } = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-5 rounded-3xl bg-card p-5 shadow-xl animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            Paso {step + 1} de {STEPS.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar instrucciones"
            className="-mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div key={step} className="flex min-h-40 items-center animate-in fade-in slide-in-from-right-4">
          <Visual />
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h2 id="ios-install-title" className="font-display text-xl font-bold text-slate-900 text-balance">
            {title}
          </h2>
          <p className="text-base leading-relaxed text-slate-600 text-pretty">{text}</p>
        </div>

        <div className="flex justify-center gap-2" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-2 bg-slate-200'}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {step === 0 ? (
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
            >
              Ahora no
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLast ? onClose() : setStep(step + 1))}
            className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground active:scale-95"
          >
            {isLast ? 'Entendido' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
