import { Button } from '@/components/ui/button'
import { Check, MessageCircle } from 'lucide-react'

const checkColors = ['#4285F4', '#34A853', '#FBBC05']

const benefits = [
  'Tutor socrático 24/7 con paciencia infinita',
  'Lectura de fotos y audios de la libreta',
  'Reportes semanales para padres bajo demanda',
  'Campamento de verano incluido',
  'Pagos vía Mercado Pago o Stripe',
]

export function Pricing() {
  return (
    <section id="precios" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-primary">
            Precios y planes
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Un precio simple para recuperar tus tardes.
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
                14 días gratis • Sin tarjeta
              </span>
            </div>

            <div className="relative mt-6 text-center">
              <div className="flex items-end justify-center gap-1.5">
                <span className="font-display text-5xl font-extrabold tracking-tight text-slate-900">
                  $20
                </span>
                <span className="pb-1.5 text-lg font-semibold text-slate-500">MXN / mes</span>
              </div>
              <p className="mt-1.5 text-sm text-slate-500">
                o $1.00 USD · por estudiante
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

            <Button
              asChild
              className="relative mt-8 h-auto w-full rounded-full bg-[#25D366] px-8 py-4 text-lg font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-[#20bd5a]"
            >
              <a href="#" className="flex items-center justify-center gap-2 whitespace-nowrap">
                <MessageCircle className="h-5 w-5 shrink-0" />
                Comenzar 14 días gratis
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
