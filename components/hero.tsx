import { Button } from '@/components/ui/button'
import { CreditCard, ShieldCheck, MousePointerClick, MessageCircle, Play } from 'lucide-react'
import {
  WhatsappPhone,
  IncomingBubble,
  OutgoingBubble,
  NotebookMessage,
} from '@/components/whatsapp-phone'

const badges = [
  { icon: CreditCard, label: 'Sin tarjeta bancaria' },
  { icon: ShieldCheck, label: 'WhatsApp oficial' },
  { icon: MousePointerClick, label: 'Cancelación en 1 clic' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_0%,rgba(37,211,102,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
        {/* copy */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Tutor socrático K-12 en WhatsApp
          </span>

          <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
            Tu hijo no necesita que le hagan la tarea.{' '}
            <span style={{ color: '#4285F4' }}>Recupera la armonía del hogar.</span>
          </h1>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600">
            El tutor socrático en WhatsApp con paciencia infinita que acompaña a tus hijos paso a
            paso para que ellos aprendan a pensar, tú disfrutes de tu hogar y las tardes recuperen
            la paz.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-auto w-full whitespace-normal rounded-full px-6 py-3 text-center text-base font-semibold shadow-md shadow-emerald-600/20 sm:w-auto"
            >
                <a href="/app">

                <MessageCircle className="h-5 w-5 shrink-0" />
                Activar 14 días gratis en WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-auto w-full whitespace-normal rounded-full border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 sm:w-auto"
            >
              <a href="#pedagogia">
                <Play className="h-4 w-4 shrink-0" />
                Ver cómo responde
              </a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {badges.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* phone */}
        <div className="relative">
          <WhatsappPhone>
            <NotebookMessage />
            <IncomingBubble>
              ¡Foto recibida! Tómate tu tiempo, aquí lo resolvemos juntos sin prisa. Imagina una
              balanza en equilibrio: para dejar sola a la <strong>x</strong>, ¿qué pasa si restamos
              4 a ambos lados?
            </IncomingBubble>
            <OutgoingBubble>Mmm... ¿quedaría 2x = 8?</OutgoingBubble>
            <IncomingBubble>
              ¡Exacto! Ahora: si 2 cajas iguales pesan 8 kilos en total, ¿cuánto pesa cada una?
            </IncomingBubble>
          </WhatsappPhone>
        </div>
      </div>
    </section>
  )
}
