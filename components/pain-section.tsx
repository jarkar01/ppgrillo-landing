import { Heart, Users } from 'lucide-react'

const cards = [
  {
    icon: Users,
    title: 'Para los Padres',
    body: 'Llegas del trabajo y te agota una tarea que ya no recuerdas cómo explicar. Perder la paciencia genera culpa cuando solo deseas disfrutar de tu hogar.',
  },
  {
    icon: Heart,
    title: 'Para los Hijos',
    body: 'Sentir ansiedad por no entender la tarea y quedarse atascado a solas con los deberes genera frustración y miedo a fallar.',
  },
]

export function PainSection() {
  return (
    <section className="border-y border-slate-200/70 bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <h2 className="mx-auto max-w-2xl text-balance text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          ¿La hora de la tarea rompió la armonía del hogar?
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cards.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl border border-slate-200 bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
