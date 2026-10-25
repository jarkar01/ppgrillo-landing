import { CalendarHeart, MessagesSquare, UtensilsCrossed } from 'lucide-react'

const moments = [
  {
    icon: UtensilsCrossed,
    label: 'Cenas en calma',
    detail: 'La mesa vuelve a ser para compartir, no para revisar tareas.',
    color: '#4285F4',
    offset: 'sm:mr-10',
  },
  {
    icon: MessagesSquare,
    label: 'Conversaciones sobre el día',
    detail: 'Hablan de lo que aprendió, no de lo que falta por hacer.',
    color: '#34A853',
    offset: 'sm:ml-10',
  },
  {
    icon: CalendarHeart,
    label: 'Fines de semana sin pendientes',
    detail: 'Sábados y domingos libres de estrés académico.',
    color: '#EA4335',
    offset: 'sm:mr-6',
  },
]

export function FamilySection() {
  return (
    <section className="border-y border-slate-200/70 bg-secondary/50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-card p-6 shadow-xl shadow-slate-900/5 sm:p-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgb(148 163 184 / 0.28) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          <ul className="relative flex flex-col gap-4">
            {moments.map(({ icon: Icon, label, detail, color, offset }) => (
              <li
                key={label}
                className={`flex items-center gap-4 rounded-2xl border border-slate-200 bg-card p-4 shadow-md shadow-slate-900/5 sm:p-5 ${offset}`}
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${color}1A`, color }}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-slate-900">{label}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{detail}</p>
                </div>
                <span
                  className="ml-auto hidden h-2.5 w-2.5 shrink-0 rounded-full sm:block"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
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
        </div>
      </div>
    </section>
  )
}
