'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, ChevronLeft, ArrowLeft, HelpCircle } from 'lucide-react'

const WHATSAPP_URL =
  'https://wa.me/5215500000000?text=' +
  encodeURIComponent('Hola, quiero hablar con un asesor de PpGrillo.')

type Faq = {
  id: string
  question: string
  answer: string
}

const FAQS: Faq[] = [
  {
    id: 'metodo',
    question: '¿Cómo funciona el método socrático?',
    answer:
      'En lugar de darle la respuesta, PpGrillo guía a tu hijo con preguntas que lo llevan a razonar y descubrir la solución por sí mismo. Así desarrolla pensamiento crítico y aprende de verdad, paso a paso, con paciencia infinita.',
  },
  {
    id: 'grados',
    question: '¿Para qué grados y materias sirve?',
    answer:
      'Acompaña a estudiantes de K-12 (preescolar a preparatoria) en materias como matemáticas, español, ciencias e historia. Se adapta al nivel y al plan de cada alumno para explicar cualquier tema.',
  },
  {
    id: 'gratis',
    question: '¿Cómo funcionan los 14 días gratis?',
    answer:
      'Activas la prueba directo en WhatsApp y tienes acceso completo al tutor durante 14 días sin costo. No se cobra nada hasta que termine la prueba, y puedes cancelar cuando quieras.',
  },
  {
    id: 'pago',
    question: 'Métodos de pago (Mercado Pago)',
    answer:
      'Aceptamos pagos seguros a través de Mercado Pago: tarjetas de crédito, débito y saldo en cuenta. El cobro es mensual y puedes cancelar en cualquier momento sin permanencia.',
  },
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const activeFaq = FAQS.find((f) => f.id === activeId) ?? null

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) setActiveId(null)
  }, [open])

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Popup */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="Preguntas frecuentes y soporte"
        className={`w-[calc(100vw-2.5rem)] max-w-[360px] origin-bottom-right overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-emerald-900/20 transition-all duration-300 ease-out ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-3 scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-primary px-4 py-4 text-primary-foreground">
          {activeFaq ? (
            <button
              type="button"
              onClick={() => setActiveId(null)}
              aria-label="Volver al menú"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-white/15"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
              <HelpCircle className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold leading-tight">
              {activeFaq ? 'Respuesta' : 'FAQ y Soporte'}
            </p>
            <p className="truncate text-xs text-primary-foreground/80">
              {activeFaq ? 'PpGrillo te ayuda' : 'Estamos para ayudarte'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar ventana"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-white/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
          {activeFaq ? (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <p className="mb-2 font-display text-[15px] font-semibold text-foreground text-pretty">
                {activeFaq.question}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {activeFaq.answer}
              </p>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:opacity-80"
              >
                <ChevronLeft className="h-4 w-4" />
                Ver otras preguntas
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                Hola, soy PpGrillo. Elige una pregunta para conocer la respuesta:
              </p>
              <ul className="flex flex-col gap-2">
                {FAQS.map((faq) => (
                  <li key={faq.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(faq.id)}
                      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-left text-sm font-medium text-secondary-foreground transition hover:border-primary/40 hover:bg-accent"
                    >
                      <span className="text-pretty">{faq.question}</span>
                      <ChevronLeft className="h-4 w-4 shrink-0 -rotate-180 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-border bg-card p-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:brightness-95"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Hablar con un asesor en WhatsApp
          </a>
        </div>
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Cerrar chat de ayuda' : 'Abrir chat de ayuda'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-emerald-900/30 transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <span className="relative flex items-center justify-center">
          <MessageCircle
            className={`h-6 w-6 transition-all duration-300 ${open ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
          />
          <X
            className={`absolute h-6 w-6 transition-all duration-300 ${open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
          />
        </span>
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-primary bg-[#25D366]" />
          </span>
        )}
      </button>
    </div>
  )
}

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.24 8.24 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42-.14-.01-.31-.01-.48-.01a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  )
}
