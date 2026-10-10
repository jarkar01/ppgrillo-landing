import { Camera, MessageCircleQuestion, Repeat } from 'lucide-react'

const steps = [
  {
    icon: Camera,
    title: 'Manda foto de tu tarea',
    body: 'Toma una foto clara del ejercicio o escríbelo tal cual. También puedes mandar un audio.',
    color: '#4285F4',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Dile dónde te atoraste',
    body: '"No entiendo el paso 2" o "¿por qué se pasa restando?" ayuda a que la pista sea exacta.',
    color: '#34A853',
  },
  {
    icon: Repeat,
    title: 'Responde y vuelve a preguntar',
    body: 'Pp Grillo te hace preguntas guía. Contesta con lo que creas; si no sale, pide otra pista.',
    color: '#FBBC05',
  },
]

export function HowToAsk() {
  return (
    <section id="como-preguntar" className="scroll-mt-20 bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-primary">
            Cómo preguntar
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Tres pasos para salir de la duda
          </h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body, color }, index) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}1a`, color }}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-slate-400">Paso {index + 1}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-pretty leading-relaxed text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
