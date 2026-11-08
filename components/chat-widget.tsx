'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, ChevronLeft, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react'

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
    question: '¿Qué incluye la versión gratuita y los planes?',
    answer:
      'La Versión Gratuita ($0 MXN) incluye 3 tareas de cortesía de por vida, sin tarjeta. El Plan Estándar ($39 MXN al mes) incluye 40 tareas e investigaciones al mes y un reporte semanal de avance para los papás por correo. El Plan Familiar ($119 MXN al mes) da consultas ilimitadas para hasta 3 usuarios en una misma cuenta familiar. Pagos seguros con Mercado Pago.',
  },
  {
    id: 'pago',
    question: 'Métodos de pago (Mercado Pago)',
    answer:
      'Aceptamos pagos seguros a través de Mercado Pago: tarjetas de crédito, débito y saldo en cuenta. El cobro es mensual y puedes cancelar en cualquier momento sin permanencia.',
  },
]

export function ChatWidget({ liftOnMobile = false }: { liftOnMobile?: boolean }) {
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
    <div
      className={`pointer-events-none fixed right-5 z-50 flex flex-col items-end gap-3 sm:right-6 md:bottom-6 ${
        liftOnMobile ? 'bottom-32' : 'bottom-5 sm:bottom-6'
      }`}
    >
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
          <Link
            href="/app"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-95"
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
            Empezar con 3 tareas gratis
          </Link>
        </div>
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Cerrar chat de ayuda' : 'Abrir chat de ayuda'}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-emerald-900/30 transition-transform duration-300 hover:scale-105 active:scale-95"
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
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FBBC05] opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-primary bg-[#FBBC05]" />
          </span>
        )}
      </button>
    </div>
  )
}
