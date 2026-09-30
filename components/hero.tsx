import { CreditCard, MessageCircle, MousePointerClick, Timer } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SignupTrigger } from '@/components/estudiantes/signup-modal'
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

const reassurances = [
  { icon: CreditCard, label: 'Sin tarjeta bancaria' },
  { icon: Timer, label: 'Registro por WhatsApp en 1 minuto' },
  { icon: MousePointerClick, label: 'Cancela en 1 clic' },
]

export function Hero() {
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
            Deja de pelear con tu hijo por la tarea.{' '}
            <span className="text-[#4285F4]">Recupera la paz de tus tardes.</span>
          </h1>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600">
            Llegas cansado del trabajo y la tarde se convierte en discusiones, frustración y libretas
            cerradas. Pp Grillo acompaña a tu hijo paso a paso con paciencia infinita: él aprende a
            razonar por su cuenta y tú vuelves a disfrutar ser su papá, no su policía escolar.
          </p>

          <SignupTrigger
            className={cn(
              buttonVariants({ size: 'lg' }),
              'mt-8 h-auto w-full cursor-pointer gap-2 whitespace-normal rounded-full bg-[#25D366] px-7 py-4 text-center text-base font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-[#20bd5a] sm:w-auto',
            )}
          >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            Comenzar prueba gratis de 14 días
          </SignupTrigger>

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
