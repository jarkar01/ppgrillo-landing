import { Button } from '@/components/ui/button'
import { Check, MessageCircle } from 'lucide-react'
import { WHATSAPP_URL, WHATSAPP_NUMBER_DISPLAY } from '@/lib/whatsapp'

type Plan = {
  name: string
  price: string
  period: string
  tagline: string
  features: string[]
  cta: string
  featured: boolean
}

const plans: Plan[] = [
  {
    name: 'Plan Gratuito',
    price: '$0',
    period: 'MXN / mes',
    tagline: 'Para empezar a pensar paso a paso.',
    features: [
      '3 tareas semanales para el alumno',
      'Renovación automática cada lunes',
      '1 consulta mensual de seguimiento para papás',
      'Fotos y notas de voz de la libreta',
    ],
    cta: 'Empezar gratis',
    featured: false,
  },
  {
    name: 'Plan Pro Ilimitado',
    price: '$49',
    period: 'MXN / mes',
    tagline: 'Paciencia infinita, sin límites de tareas.',
    features: [
      'Acceso socrático ilimitado para el alumno',
      'Hasta 8 peticiones mensuales de seguimiento para papás',
      'Fotos y notas de voz de la libreta',
      'Campamento de verano incluido',
      'Pago seguro vía Mercado Pago y Stripe',
    ],
    cta: 'Activar Plan Pro',
    featured: true,
  },
]

const checkColors = ['#4285F4', '#34A853', '#FBBC05']

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-[2rem] bg-card p-8 sm:p-10 ${
        plan.featured
          ? 'border-2 border-[#4285F4]/40 shadow-xl shadow-blue-600/10'
          : 'border border-slate-200 shadow-sm'
      }`}
    >
      {plan.featured ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#4285F4] to-[#34A853]"
            aria-hidden="true"
          />
          <span className="absolute right-6 top-6 rounded-full bg-[#4285F4] px-3 py-1 text-xs font-bold text-white">
            Recomendado
          </span>
        </>
      ) : null}

      <h3 className="font-display text-xl font-extrabold text-slate-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>

      <div className="mt-6 flex items-end gap-1.5">
        <span className="font-display text-5xl font-extrabold tracking-tight text-slate-900">
          {plan.price}
        </span>
        <span className="pb-1.5 text-lg font-semibold text-slate-500">{plan.period}</span>
      </div>

      <ul className="mt-8 flex flex-1 flex-col gap-3.5">
        {plan.features.map((feature, i) => (
          <li key={feature} className="flex items-start gap-3 text-slate-700">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: checkColors[i % checkColors.length] }}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-[15px] leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        nativeButton={false}
        render={<a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" />}
        className={`mt-8 h-auto w-full gap-2 whitespace-nowrap rounded-full px-8 py-4 text-lg font-bold ${
          plan.featured
            ? 'bg-[#25D366] text-white shadow-md shadow-emerald-600/20 hover:bg-[#20bd5a]'
            : 'border-2 border-[#25D366] bg-transparent text-[#128C7E] hover:bg-[#25D366]/10'
        }`}
      >
        <MessageCircle className="h-5 w-5 shrink-0" />
        {plan.cta}
      </Button>
    </article>
  )
}

export function Pricing() {
  return (
    <section id="precios" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-primary">
            Precios y planes
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Empieza gratis. Crece sin límites.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-slate-600">
            Todo sucede en WhatsApp, sin apps ni tarjeta para comenzar.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          WhatsApp oficial: <span className="font-semibold text-slate-700">{WHATSAPP_NUMBER_DISPLAY}</span>
        </p>
      </div>
    </section>
  )
}
