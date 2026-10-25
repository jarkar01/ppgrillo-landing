import { Check, CreditCard, MessageCircle } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'
import { WHATSAPP_TRIAL_URL } from '@/lib/whatsapp'
import {
  FAMILY_PRICE_MXN,
  FREE_LIFETIME_TASKS,
  MERCADOPAGO_FAMILY_URL,
  MERCADOPAGO_STANDARD_URL,
  STANDARD_MONTHLY_TASKS,
  STANDARD_PRICE_MXN,
} from '@/lib/plans'

type Plan = {
  name: string
  price: string
  period: string
  features: string[]
  cta: string
  href: string
  payment?: boolean
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Versión Gratuita',
    price: '$0',
    period: 'MXN',
    features: [
      `${FREE_LIFETIME_TASKS} tareas de cortesía de por vida`,
      'Sin tarjeta ni registro',
      'Tutor socrático completo en WhatsApp',
    ],
    cta: 'Empezar gratis',
    href: WHATSAPP_TRIAL_URL,
  },
  {
    name: 'Plan Estándar',
    price: `$${STANDARD_PRICE_MXN}`,
    period: 'MXN / mes',
    featured: true,
    payment: true,
    features: [
      `Tareas semanales del ciclo escolar (hasta ${STANDARD_MONTHLY_TASKS} al mes)`,
      'Reporte semanal de avance para padres en WhatsApp',
      'Fotos y notas de voz de la libreta',
    ],
    cta: 'Contratar Estándar',
    href: MERCADOPAGO_STANDARD_URL,
  },
  {
    name: 'Plan Familiar',
    price: `$${FAMILY_PRICE_MXN}`,
    period: 'MXN / mes',
    payment: true,
    features: [
      'Consultas ilimitadas',
      'Multi-hijo en la misma línea de WhatsApp',
      'Reporte semanal de avance para padres',
    ],
    cta: 'Contratar Familiar',
    href: MERCADOPAGO_FAMILY_URL,
  },
]

export function CampaignPlans() {
  return (
    <section
      id="planes"
      aria-labelledby="planes-title"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 pt-6 pb-10 text-center sm:max-w-2xl md:max-w-5xl"
    >
      <div className="flex flex-col items-center gap-2">
        <h2 id="planes-title" className="font-display text-2xl font-extrabold tracking-tight text-balance text-slate-900">
          Planes
        </h2>
        <p className="text-pretty text-sm leading-relaxed text-slate-600">
          Empieza con {FREE_LIFETIME_TASKS} tareas gratis y elige un plan solo si te convence.
        </p>
      </div>

      <ul className="grid w-full gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <li
            key={plan.name}
            className={`relative flex flex-col gap-4 rounded-2xl border-2 bg-white p-5 text-left ${
              plan.featured ? 'border-[#25D366] shadow-md shadow-emerald-600/10' : 'border-slate-200'
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-5 rounded-full bg-[#25D366] px-3 py-0.5 text-xs font-bold text-white">
                Más elegido
              </span>
            )}
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-lg font-bold text-slate-900">{plan.name}</h3>
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-sm font-medium text-slate-500">{plan.period}</span>
              </p>
            </div>

            <ul className="flex flex-1 flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#128C7E]" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            <WhatsappCta
              href={plan.href}
              className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] px-5 py-2.5 text-[15px] leading-snug font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99] ${
                plan.featured
                  ? 'bg-[#25D366] text-white hover:bg-[#20bd5a]'
                  : 'bg-emerald-50/60 text-[#128C7E] hover:bg-emerald-50'
              }`}
            >
              {plan.payment ? (
                <CreditCard className="h-5 w-5 shrink-0" aria-hidden="true" />
              ) : (
                <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              )}
              {plan.cta}
              {plan.payment && <span className="sr-only"> (abre Mercado Pago en una pestaña nueva)</span>}
            </WhatsappCta>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">
        Pago seguro con Mercado Pago • Cobro mensual • Cancela cuando quieras
      </p>
    </section>
  )
}
