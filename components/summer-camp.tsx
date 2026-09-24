import { Sun, Timer, ToggleRight, Gift } from 'lucide-react'

const features = [
  {
    icon: Timer,
    title: 'Retos diarios de 15 minutos',
    body: 'Acertijos y lógica aplicada directo en WhatsApp para mantener la mente activa.',
  },
  {
    icon: ToggleRight,
    title: 'Activación opcional',
    body: 'Enciende o apaga cuando quieras enviando VERANO ON / VERANO OFF.',
  },
  {
    icon: Gift,
    title: 'Sin costo adicional',
    body: 'Incluido en tu suscripción. Cero rezago, cero aburrimiento.',
  },
]

export function SummerCamp() {
  return (
    <section id="verano" className="scroll-mt-20 bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-8 shadow-sm sm:p-12">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-300/30 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/90 px-3.5 py-1.5 text-xs font-bold text-amber-950">
              <Sun className="h-4 w-4" />
              Julio y Agosto
            </span>

            <h2 className="mt-5 max-w-2xl text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Campamento de Verano PpGrillo: cero rezago, cero aburrimiento.
            </h2>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-amber-100 bg-white/70 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/90 text-amber-950">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
