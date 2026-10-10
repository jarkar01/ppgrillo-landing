import {
  ArrowDown,
  CreditCard,
  MessageCircle,
  MousePointerClick,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WhatsappCta } from '@/components/whatsapp-cta'
import {
  WhatsappPhone,
  IncomingBubble,
  OutgoingBubble,
  NotebookMessage,
} from '@/components/whatsapp-phone'

const badgeItems = [
  { label: 'Paz en el hogar', color: '#34A853' },
  { label: 'K-8 a K-12', color: '#4285F4' },
  { label: 'Método Socrático', color: '#FBBC05' },
]

const defaultReassurances = [
  { icon: CreditCard, label: 'Sin tarjeta bancaria' },
  { icon: Smartphone, label: 'Sin apps que descargar' },
  { icon: MousePointerClick, label: 'Cancela cuando quieras' },
]

type HeroProps = {
  ctaIcon?: LucideIcon
  reassurances?: { icon: LucideIcon; label: string }[]
  learnMoreHref?: string
}

export function Hero({
  ctaIcon: CtaIcon = MessageCircle,
  reassurances = defaultReassurances,
  learnMoreHref = '#saber-mas',
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-24">
        <div className="max-w-xl">
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-full border border-slate-200 bg-card px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            {badgeItems.map(({ label, color }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </span>

          <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
            Deja de pelear por la tarea.{' '}
            <span className="text-[#4285F4]">Recupera la paz de tus tardes.</span>
          </h1>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600">
            PpGrillo acompaña a tu hijo a razonar paso a paso por WhatsApp. Sin apps que descargar.
            Un tutor socrático paciente que no le hace la tarea: le enseña a pensar.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <WhatsappCta
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-auto w-full gap-2 whitespace-normal rounded-full bg-[#25D366] px-7 py-4 text-center text-base font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-[#20bd5a] sm:w-auto',
              )}
            >
              <CtaIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              Comenzar prueba gratis de 14 días
            </WhatsappCta>
            <a
              href={learnMoreHref}
              className="inline-flex items-center gap-1.5 text-base font-semibold text-primary underline-offset-4 hover:underline"
            >
              ¿Quieres saber más?
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {reassurances.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Icon className="h-4 w-4 text-[#34A853]" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <WhatsappPhone>
            <NotebookMessage />
            <IncomingBubble>
              ¡Recibí tu foto! Tranquilo, no hay prisa: lo resolvemos juntos. Imagina una balanza en
              equilibrio. Para dejar sola a la <strong>x</strong>, ¿qué pasa si quitamos 4 de ambos
              lados?
            </IncomingBubble>
            <OutgoingBubble>Mmm... ¿quedaría 2x = 8?</OutgoingBubble>
            <IncomingBubble>
              ¡Eso es, lo razonaste tú solo! Último paso: si 2 cajas iguales pesan 8 kilos, ¿cuánto
              pesa cada una?
            </IncomingBubble>
          </WhatsappPhone>
        </div>
      </div>
    </section>
  )
}
