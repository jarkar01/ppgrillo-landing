import { BarChart3, BookOpen, CheckCircle2, MessageSquareHeart, Info } from 'lucide-react'

export function ReportSection() {
  return (
    <section className="bg-slate-900 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-emerald-400">
            Reporte bajo demanda
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            El control de los padres, sin invadir la autonomía del alumno.
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-300">
            Cuando quieras saber cómo va tu hijo, solo escribe una palabra. PpGrillo te devuelve un
            desglose claro y accionable, respetando el espacio de aprendizaje del estudiante.
          </p>

          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-sm text-slate-300">
              Hasta <strong className="text-white">2 reportes por semana</strong> para dar tiempo a
              consolidar el aprendizaje.
            </p>
          </div>
        </div>

        {/* chat mock */}
        <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-800/60 p-4 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-4 py-2.5 text-sm font-semibold text-slate-800">
                INFORME
              </div>
            </div>

            <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-4 text-slate-700 shadow-sm">
              <p className="text-sm font-bold text-slate-900">Reporte semanal · Sofía</p>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong>4</strong> sesiones activas esta semana
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  <span>Materias: Matemáticas · Ciencias</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Concepto dominado: <strong>ecuaciones con balanzas</strong>
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
                <MessageSquareHeart className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>Tip para conversar en familia:</strong> pídele a Sofía que te explique
                  cómo &quot;equilibró la balanza&quot;. ¡Le encantará enseñarte!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
