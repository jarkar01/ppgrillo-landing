import { Gamepad2, Sun, Users } from 'lucide-react'

const moments = [
  { icon: Gamepad2, label: 'Jugar', color: '#4285F4' },
  { icon: Users, label: 'Salir con amigos', color: '#34A853' },
  { icon: Sun, label: 'Disfrutar sin pendientes', color: '#FBBC05' },
]

export function FreeTime() {
  return (
    <section className="border-y border-slate-200/70 bg-secondary/50">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-5 py-16 text-center sm:px-8 lg:py-24">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-[#4285F4]">
          Tu tiempo libre
        </p>
        <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Recupera tus tardes
        </h2>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600">
          Termina tus tareas temprano y quédate con tiempo para jugar, salir con amigos y disfrutar
          sin el estrés de pendientes acumulados.
        </p>

        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {moments.map(({ icon: Icon, label, color }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-card px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
