import { BarChart3, Camera, Gauge, MessageCircle, Sparkles } from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    color: '#25D366',
    title: 'Tutor socrático en WhatsApp',
    body: 'Sin instalar apps nuevas ni recordar contraseñas.',
  },
  {
    icon: Camera,
    color: '#4285F4',
    title: 'Fotos de la libreta y audios',
    body: 'Tu hijo manda una foto del ejercicio o un mensaje de voz y listo.',
  },
  {
    icon: Sparkles,
    color: '#FBBC05',
    title: 'Impulsado por Google Vertex AI',
    body: 'Inteligencia pedagógica socrática que guía con preguntas, no con respuestas.',
  },
  {
    icon: Gauge,
    color: '#EA4335',
    title: '25 consultas diarias',
    body: 'Un límite consciente que fomenta la concentración y el avance genuino.',
  },
  {
    icon: BarChart3,
    color: '#34A853',
    title: 'Reportes para padres bajo demanda',
    body: 'Evolución periódica y materias consultadas, cuando tú los pidas.',
  },
]

export function FeaturesSection() {
  return (
    <section id="funciones" className="scroll-mt-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-[#4285F4]">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Todo sucede en el WhatsApp que tu hijo ya usa
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600">
            Sin plataformas complicadas. Tecnología seria, diseñada para que aprenda a pensar.
          </p>
        </div>

        <ul className="flex flex-col divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-card shadow-sm">
          {features.map(({ icon: Icon, color, title, body }) => (
            <li key={title} className="flex items-start gap-4 p-5 sm:p-6">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${color}1A`, color }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1 leading-relaxed text-slate-600">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
