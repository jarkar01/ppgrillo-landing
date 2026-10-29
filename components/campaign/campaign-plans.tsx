import { Check } from 'lucide-react'
import { CheckoutButton } from '@/components/web/checkout-button'
import { StartFreeButton } from '@/components/web/start-free'
import {
  FAMILY_MAX_USERS,
  FAMILY_PRICE_MXN,
  FREE_LIFETIME_TASKS,
  STANDARD_MONTHLY_TASKS,
  STANDARD_PRICE_MXN,
  type PlanId,
} from '@/lib/plans'

type Plan = {
  id: PlanId
  name: string
  price: string
  period: string
  features: string[]
  cta: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Versión Gratuita',
    price: '$0',
    period: 'MXN',
    features: [
      `${FREE_LIFETIME_TASKS} tareas de cortesía de por vida`,
      'Solo nombre y apellido: sin tarjeta ni teléfono',
      'Tutor socrático completo aquí en la web',
    ],
    cta: 'Empezar gratis',
  },
  {
    id: 'standard',
    name: 'Plan Estándar',
    price: `$${STANDARD_PRICE_MXN}`,
    period: 'MXN / mes',
    featured: true,
    features: [
      `Tareas semanales del ciclo escolar (hasta ${STANDARD_MONTHLY_TASKS} al mes)`,
      'Reporte semanal de avance para padres en WhatsApp',
      'Fotos y notas de voz de la libreta',
    ],
    cta: 'Contratar Estándar',
  },
  {
    id: 'family',
    name: 'Plan Familiar',
    price: `$${FAMILY_PRICE_MXN}`,
    period: 'MXN / mes',
    features: [
      'Consultas ilimitadas',
      `Hasta ${FAMILY_MAX_USERS} usuarios en una misma cuenta familiar`,
      'Reportes diarios de avance a solicitud',
    ],
    cta: 'Contratar Familiar',
  },
]

export function PlanCards({ includeFree = true }: { includeFree?: boolean }) {
  const plans = includeFree ? PLANS : PLANS.filter((plan) => plan.id !== 'free')
  return (
    <ul className={`grid w-full gap-4 ${includeFree ? 'md:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {plans.map((plan) => (
        <li
          key={plan.id}
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

          {plan.id === 'free' ? (
            <StartFreeButton variant="secondary">{plan.cta}</StartFreeButton>
          ) : (
            <CheckoutButton
              plan={plan.id}
              planName={plan.name}
              price={`${plan.price} ${plan.period}`}
              label={plan.cta}
              featured={plan.featured}
            />
          )}
        </li>
      ))}
    </ul>
  )
}

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

      <PlanCards />

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-pretty text-sm leading-relaxed text-slate-600">
          El acceso gratuito solo pide tu nombre y apellido. Tu número de WhatsApp se solicita
          únicamente al contratar un plan de pago.
        </p>
        <p className="text-xs text-slate-500">
          Pago seguro con Mercado Pago • Cobro mensual • Cancela cuando quieras
        </p>
      </div>
    </section>
  )
}
