import { MessageCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  WhatsappPhone,
  IncomingBubble,
  OutgoingBubble,
  NotebookMessage,
} from '@/components/whatsapp-phone'
import { SignupTrigger } from './signup-modal'

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
            ¿Atorado con la tarea a las 9 de la noche?{' '}
            <span className="text-[#4285F4]">Termínala en la mitad de tiempo sin que te regañen</span>
          </h1>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600">
            Cuando el profe explica como si hablara ruso, Pp Grillo te acompaña paso a paso. No te
            juzga, no se desespera y te da las pistas clave para que lo entiendas tú solo en 2
            minutos.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <SignupTrigger
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-auto w-full cursor-pointer gap-2 whitespace-normal rounded-full bg-[#25D366] px-7 py-4 text-center text-base font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-[#20bd5a] sm:w-auto sm:self-start',
              )}
            >
              <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              Probar 14 días gratis con WhatsApp
            </SignupTrigger>
            <p className="text-sm font-medium text-slate-500">
              Sin contraseñas • Sin tarjetas bancarias • Acceso directo
            </p>
          </div>
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
