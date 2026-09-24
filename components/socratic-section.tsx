import { Camera, Infinity as InfinityIcon, Lightbulb } from 'lucide-react'

const cards = [
  {
    num: '01',
    icon: Camera,
    title: 'Visión Inmediata',
    body: 'Envía foto o audio de su libreta o libro. PpGrillo identifica el planteamiento al instante.',
    iconBg: '#4285F4',
    iconColor: '#ffffff',
  },
  {
    num: '02',
    icon: InfinityIcon,
    title: 'Paciencia Infinita',
    body: 'Acompañamiento que nunca se enoja ni se frustra, permitiendo al estudiante avanzar a su propio ritmo.',
    iconBg: '#EA4335',
    iconColor: '#ffffff',
  },
  {
    num: '03',
    icon: Lightbulb,
    title: 'Razonamiento Propio',
    body: 'Una sola pregunta guía a la vez. Cuando el estudiante deduce la solución, el conocimiento se consolida.',
    iconBg: '#FBBC05',
    iconColor: '#3c2f00',
  },
]

export function SocraticSection() {
  return (
    <section id="pedagogia" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-primary">
            Pedagogía Socrática
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            El Candado Socrático con Paciencia Infinita
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map(({ num, icon: Icon, title, body, iconBg, iconColor }) => (
            <div
              key={num}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-slate-100 transition-colors group-hover:text-accent">
                {num}
              </span>
              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
                style={{ backgroundColor: iconBg, color: iconColor }}
              >
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="relative mt-6 font-display text-xl font-bold text-slate-900">
                {title}
              </h3>
              <p className="relative mt-3 leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
