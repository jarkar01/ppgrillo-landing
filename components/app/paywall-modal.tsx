'use client'

import { useEffect } from 'react'
import { Check, Lock } from 'lucide-react'
import { PpGrilloAvatar } from './brand-mark'
import { PLAN, PLAN_TAGLINE, MERCADOPAGO_CHECKOUT_URL, SUPPORT_WHATSAPP_URL } from './types'

export function PaywallModal({ onSubscribe }: { onSubscribe: () => void }) {
  // Bloquea el scroll del fondo mientras el modal está abierto.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* backdrop no descartable: sin onClick para cerrar */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md animate-[paywall-in_0.35s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-slate-200">
        <div className="flex flex-col items-center gap-3 bg-primary/5 px-6 pt-8 pb-6 text-center">
          <span className="relative">
            <PpGrilloAvatar className="h-14 w-14" />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
              <Lock className="h-3 w-3" />
            </span>
          </span>
          <h2 id="paywall-title" className="text-balance font-display text-xl font-extrabold text-slate-900">
            Tu periodo de prueba de 14 días ha concluido
          </h2>
          <p className="text-pretty text-[15px] leading-relaxed text-slate-600">
            Continúa acompañando el aprendizaje de tu hijo con razonamiento socrático ilimitado.
          </p>
        </div>

        <div className="px-6 py-5">
          {/* resumen del plan */}
          <div className="rounded-2xl border border-slate-200 bg-background p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-700">{PLAN.name}</span>
              <span className="font-display text-2xl font-extrabold text-slate-900">
                {PLAN.price}
                <span className="text-sm font-semibold text-slate-400">{PLAN.period}</span>
              </span>
            </div>
            <p className="mt-1 text-[13px] font-medium leading-snug text-primary">
              {PLAN_TAGLINE}
            </p>
            <ul className="mt-3 space-y-2">
              {PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] leading-snug text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* pago Mercado Pago */}
          <a
            href={MERCADOPAGO_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onSubscribe}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#009EE3] px-4 py-3.5 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#008fce] active:scale-[0.99]"
          >
            <MercadoPagoIcon className="h-5 w-5" />
            Continuar con Mercado Pago
          </a>

          {/* soporte */}
          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-accent hover:text-slate-800"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Contactar a soporte por WhatsApp
          </a>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
            Pago seguro procesado por Mercado Pago. Cancela cuando quieras, sin permanencia.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes paywall-in {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

function MercadoPagoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <ellipse cx="12" cy="12" rx="11" ry="8" fill="#fff" opacity="0.18" />
      <path
        d="M6.5 13.2c1.4 1.1 3.4 1.8 5.5 1.8s4.1-.7 5.5-1.8c.3-.2.7 0 .6.4-.7 2-3.2 3.4-6.1 3.4s-5.4-1.4-6.1-3.4c-.1-.4.3-.6.6-.4Z"
        fill="#fff"
      />
      <circle cx="9" cy="10.5" r="1.1" fill="#fff" />
      <circle cx="15" cy="10.5" r="1.1" fill="#fff" />
    </svg>
  )
}

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
      <path d="M12.05 2.5A9.5 9.5 0 0 0 3.9 16.83L2.5 21.5l4.78-1.25A9.5 9.5 0 1 0 12.05 2.5Zm0 17.2a7.7 7.7 0 0 1-3.92-1.07l-.28-.17-2.9.76.77-2.83-.18-.29a7.7 7.7 0 1 1 6.51 3.6Z" />
    </svg>
  )
}
