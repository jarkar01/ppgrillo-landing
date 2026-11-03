'use client'

import { Lock } from 'lucide-react'
import { CheckoutButton } from '@/components/web/checkout-button'
import {
  FAMILY_MAX_USERS,
  FAMILY_PRICE_MXN,
  FREE_LIFETIME_TASKS,
  STANDARD_MONTHLY_TASKS,
  STANDARD_PRICE_MXN,
  STANDARD_QUARTERLY_PRICE_MXN,
  type BillingPeriod,
  type PaidPlanId,
} from '@/lib/plans'

type PaywallOption = {
  plan: PaidPlanId
  period: BillingPeriod
  name: string
  price: string
  detail: string
  featured?: boolean
}

const OPTIONS: PaywallOption[] = [
  {
    plan: 'standard',
    period: 'monthly',
    name: 'Plan Estándar Mensual',
    price: `$${STANDARD_PRICE_MXN} MXN/mes`,
    detail: `Hasta ${STANDARD_MONTHLY_TASKS} tareas al mes y reporte semanal para padres por correo electrónico.`,
    featured: true,
  },
  {
    plan: 'standard',
    period: 'quarterly',
    name: 'Plan Estándar Trimestral',
    price: `$${STANDARD_QUARTERLY_PRICE_MXN} MXN/trimestre`,
    detail: `Los mismos beneficios del Plan Estándar, cubiertos por tres meses en un solo pago.`,
  },
  {
    plan: 'family',
    period: 'monthly',
    name: 'Plan Familiar',
    price: `$${FAMILY_PRICE_MXN} MXN/mes`,
    detail: `Tareas ilimitadas para hasta ${FAMILY_MAX_USERS} usuarios y reporte semanal por correo electrónico.`,
  },
]

export function ChatPaywall({ firstName }: { firstName: string }) {
  return (
    <section
      ref={(node) => node?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      aria-labelledby="paywall-title"
      className="flex flex-col gap-4 rounded-3xl border-2 border-[#25D366] bg-white p-5"
    >
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#128C7E]">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Tareas gratis agotadas
        </span>
        <h2 id="paywall-title" className="font-display text-xl font-bold text-balance text-slate-900">
          {firstName}, ya usaste tus {FREE_LIFETIME_TASKS} tareas de cortesía
        </h2>
        <p className="text-sm leading-relaxed text-pretty text-slate-600">
          Elige un plan para seguir resolviendo tareas paso a paso con PpGrillo. El pago es seguro con Mercado Pago.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <li
            key={`${option.plan}-${option.period}`}
            className={`flex flex-col gap-3 rounded-2xl border p-4 ${
              option.featured ? 'border-[#25D366] bg-emerald-50/60' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-display text-base font-bold text-slate-900">{option.name}</h3>
              <span className="text-sm font-semibold text-slate-700">{option.price}</span>
            </div>
            <p className="text-sm leading-relaxed text-pretty text-slate-600">{option.detail}</p>
            <CheckoutButton
              plan={option.plan}
              defaultPeriod={option.period}
              planName={option.name}
              price={option.price}
              label={`Suscribirme al ${option.name}`}
              featured={option.featured}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
