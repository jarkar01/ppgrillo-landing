import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: '¿Tiene algún costo o compromiso?',
    a: 'Pruebas 14 días completamente gratis sin ingresar tarjeta. Si decides continuar, el costo mensual es accesible y puedes cancelar en cualquier momento con un clic.',
  },
  {
    q: '¿Qué materias cubre?',
    a: 'Matemáticas, Español, Ciencias y comprensión lectora alineadas a los programas escolares de Primaria y Secundaria.',
  },
  {
    q: '¿Es seguro para mi hijo?',
    a: 'PpGrillo es un espacio 100% privado, protegido y sin anuncios ni contenido inapropiado.',
  },
  {
    q: '¿Cómo se usa?',
    a: 'Funciona desde cualquier teléfono celular, tablet o computadora, sin descargas complicadas.',
  },
]

export function GoFaq() {
  return (
    <section aria-labelledby="faq-title" className="flex flex-col gap-5">
      <h2
        id="faq-title"
        className="text-balance text-center font-display text-xl font-extrabold tracking-tight text-slate-900"
      >
        Preguntas frecuentes
      </h2>
      <div className="flex flex-col gap-3">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:border-emerald-200"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 [&::-webkit-details-marker]:hidden">
              <span className="text-pretty">{q}</span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-emerald-600 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="text-pretty px-4 pb-4 text-sm leading-relaxed text-slate-600">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
