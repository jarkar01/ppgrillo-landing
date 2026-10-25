import { buttonVariants } from '@/components/ui/button'
import { WhatsappCta } from '@/components/whatsapp-cta'
import { cn } from '@/lib/utils'
import { Check, MessageCircle } from 'lucide-react'

import {
  FAMILY_PRICE_MXN,
  FREE_LIFETIME_TASKS,
  MERCADOPAGO_FAMILY_URL,
  MERCADOPAGO_STANDARD_URL,
  STANDARD_MONTHLY_TASKS,
  STANDARD_PRICE_MXN,
} from '@/lib/plans'

const checkColors = ['#4285F4', '#34A853', '#FBBC05']

const defaultBenefits = [
  'Tutor socrático 24/7 con paciencia infinita',
  'Lectura de fotos y audios de la libreta',
  'Reportes para padres bajo demanda',
  'Campamento de verano incluido',
  'Pagos vía Mercado Pago o Stripe',
]

type PricingProps = {
  title?: string
  benefits?: string[]
}

const ctaClass = cn(
  buttonVariants(),
  'relative mt-8 h-auto w-full gap-2 whitespace-nowrap rounded-full bg-[#25D366] px-8 py-4 text-lg font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-[#20bd5a]',
)

export function Pricing({
  title = 'Un precio simple para recuperar tus tardes.',
  benefits = defaultBenefits,
}: PricingProps = {}) {
  return (
    <section id="precios" className="relative z-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-primary">
            Precios y planes
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-primary/30 bg-card p-8 shadow-xl shadow-emerald-600/10 sm:p-10">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#4285F4] to-[#34A853]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(37,211,102,0.12),transparent)]"
              aria-hidden="true"
            />
            <div className="relative flex justify-center">
              <span className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-foreground">
                {FREE_LIFETIME_TASKS} tareas gratis de por vida • Sin tarjeta
              </span>
            </div>

            <div className="relative mt-6 text-center">
              <div className="flex items-end justify-center gap-1.5">
                <span className="font-display text-5xl font-extrabold tracking-tight text-slate-900">
                  ${STANDARD_PRICE_MXN}
                </span>
                <span className="pb-1.5 text-lg font-semibold text-slate-500">MXN / mes</span>
              </div>
              <p className="mt-1.5 text-sm text-slate-500">
                Plan Estándar · hasta {STANDARD_MONTHLY_TASKS} tareas al mes
              </p>
              <p className="mx-auto mt-3 max-w-xs text-pretty text-[13px] font-medium leading-snug text-primary">
                ¿Varios hermanos o tareas ilimitadas? Plan Familiar por ${FAMILY_PRICE_MXN} MXN / mes.
              </p>
            </div>

            <ul className="relative mt-8 space-y-3.5">
              {benefits.map((benefit, i) => (
                <li key={benefit} className="flex items-start gap-3 text-slate-700">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: checkColors[i % checkColors.length] }}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>

            <WhatsappCta className={ctaClass}>
              <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              Empezar con {FREE_LIFETIME_TASKS} tareas gratis
            </WhatsappCta>

            <div className="relative mt-6 flex flex-col items-center gap-3 border-t border-slate-200 pt-6">
              <p className="text-center text-[13px] text-slate-500">
                ¿Ya decidido? Suscríbete directo con Mercado Pago
              </p>
              <a
                href={MERCADOPAGO_STANDARD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full border-2 border-primary px-6 py-3 text-[15px] font-bold text-primary transition-colors hover:bg-primary/10"
              >
                Plan Estándar · ${STANDARD_PRICE_MXN} MXN al mes
                <span className="sr-only"> (abre Mercado Pago en una pestaña nueva)</span>
              </a>
              <a
                href={MERCADOPAGO_FAMILY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full border-2 border-slate-300 px-6 py-3 text-[15px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Plan Familiar · ${FAMILY_PRICE_MXN} MXN al mes
                <span className="sr-only"> (abre Mercado Pago en una pestaña nueva)</span>
              </a>
              <p className="text-center text-xs text-slate-500">
                Cobro recurrente mensual • Cancela cuando quieras sin contratos
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
