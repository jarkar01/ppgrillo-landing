import { ArrowDown, MessageCircle } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  WhatsappPhone,
  IncomingBubble,
  OutgoingBubble,
  NotebookMessage,
} from '@/components/whatsapp-phone'

export function StudentHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_0%,rgba(66,133,244,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#4285F4]/10 px-3.5 py-1.5 text-xs font-semibold text-[#1a5fd0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" aria-hidden="true" />
            Tutor Socrático Inteligente • K-8 a K-12
          </span>

          <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
            Tu tutor privado 24/7{' '}
            <span className="text-[#4285F4]">en WhatsApp</span>
          </h1>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600">
            Manda foto de tu tarea y sal de la duda paso a paso. Pp Grillo no te juzga, no se
            desespera y te da las pistas clave para que lo entiendas tú solo.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <WhatsappCta
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-auto w-full gap-2 whitespace-normal rounded-full bg-[#25D366] px-7 py-4 text-center text-base font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-[#20bd5a] sm:w-auto',
              )}
            >
              <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              Comenzar prueba gratis de 14 días
            </WhatsappCta>
            <a
              href="#saber-mas"
              className="inline-flex items-center gap-1.5 text-base font-semibold text-primary underline-offset-4 hover:underline"
            >
              ¿Quieres saber más?
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">
            Sin contraseñas • Sin tarjetas bancarias • Sin apps que descargar
          </p>
        </div>

        <div className="relative">
          <WhatsappPhone tag="Hoy • 9:12 p.m.">
            <NotebookMessage />
            <IncomingBubble>
              ¡Va, lo sacamos juntos! Sin prisa. Piensa en una balanza en equilibrio: para dejar
              sola a la <strong>x</strong>, ¿qué pasaría si le quitas 4 a ambos lados?
            </IncomingBubble>
            <OutgoingBubble>Ahh... ¿quedaría 2x = 8?</OutgoingBubble>
            <IncomingBubble>
              ¡Eso! Ya casi. Si 2 cajas iguales pesan 8 kilos, ¿cuánto pesa cada una? Tú dime.
            </IncomingBubble>
            <OutgoingBubble>¡4! x = 4, ya entendí</OutgoingBubble>
          </WhatsappPhone>
        </div>
      </div>
    </section>
  )
}
