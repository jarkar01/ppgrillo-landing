import { Check, MessageCircle } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'
import { WHATSAPP_TRIAL_URL } from '@/lib/whatsapp'

type Plan = {
  name: string
  price: string
  period: string
  features: string[]
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Plan Gratuito',
    price: '$0',
    period: 'MXN',
    features: [
      '3 tareas semanales para el alumno (se renuevan cada lunes)',
      '1 consulta mensual de seguimiento para papás',
    ],
  },
  {
    name: 'Plan Pro Ilimitado',
    price: '$49',
    period: 'MXN al mes',
    featured: true,
    features: [
      'Acceso socrático ilimitado para el alumno',
      'Hasta 8 peticiones mensuales de seguimiento para papás',
    ],
  },
]

export function CampaignPlans() {
  return (
    <section
      id="planes"
      aria-labelledby="planes-title"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 pt-6 pb-10 text-center sm:max-w-2xl"
    >
      <h2 id="planes-title" className="font-display text-2xl font-extrabold tracking-tight text-balance text-slate-900">
        Planes
      </h2>

      <ul className="grid w-full gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <li
            key={plan.name}
            className={`flex flex-col gap-4 rounded-2xl border-2 bg-white p-5 text-left ${
              plan.featured ? 'border-[#25D366] shadow-md shadow-emerald-600/10' : 'border-slate-200'
            }`}
          >
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
              href={WHATSAPP_TRIAL_URL}
              className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] px-5 py-2.5 text-[15px] leading-snug font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99] ${
                plan.featured
                  ? 'bg-[#25D366] text-white hover:bg-[#20bd5a]'
                  : 'bg-emerald-50/60 text-[#128C7E] hover:bg-emerald-50'
              }`}
            >
              <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              {plan.featured ? 'Empezar con Pro' : 'Empezar gratis'}
            </WhatsappCta>
          </li>
        ))}
      </ul>
    </section>
  )
}
