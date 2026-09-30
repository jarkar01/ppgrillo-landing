import Image from 'next/image'
import { CalendarHeart, MessagesSquare, UtensilsCrossed } from 'lucide-react'

const moments = [
  { icon: UtensilsCrossed, label: 'Cenas en calma', color: '#4285F4' },
  { icon: MessagesSquare, label: 'Conversaciones sobre el día', color: '#34A853' },
  { icon: CalendarHeart, label: 'Fines de semana sin pendientes', color: '#EA4335' },
]

export function FamilySection() {
  return (
    <section className="border-y border-slate-200/70 bg-secondary/50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10">
          <Image
            src="/images/familia-cena.png"
            alt="Familia conversando y riendo en la mesa durante la cena"
            width={1024}
            height={1024}
            className="aspect-[4/3] h-auto w-full object-cover"
          />
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-[#4285F4]">
            Para toda la familia
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Las tardes vuelven a ser momentos familiares, no zonas de batalla
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600">
            Cenas en calma, conversaciones sobre el día y fines de semana libres de pendientes
            escolares. El hogar deja de girar en torno al estrés académico.
          </p>

          <ul className="mt-8 flex flex-wrap gap-3">
            {moments.map(({ icon: Icon, label, color }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-card px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
              >
                <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
