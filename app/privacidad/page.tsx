import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Database, Target, Cloud, Users, KeyRound } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Aviso de Privacidad · PpGrillo',
  description:
    'Aviso de Privacidad Integral de PpGrillo (Arka Universidad Digital S.A. de C.V.): protección de datos de menores, consentimiento parental, proveedores de IA y derechos ARCO.',
}

function Brand() {
  return (
    <span className="font-display text-xl font-extrabold leading-none tracking-tight">
      <span style={{ color: '#EA4335' }}>P</span>
      <span style={{ color: '#34A853' }}>p</span>
      <span style={{ color: '#4285F4' }}>Grill</span>
      <span style={{ color: '#FBBC05' }}>o</span>
    </span>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-3 leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-secondary/40">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <header className="mt-8">
          <div className="flex items-center gap-3">
            <Brand />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Protección de menores
            </span>
          </div>
          <h1 className="mt-5 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Aviso de Privacidad Integral
          </h1>
          <p className="mt-2 text-pretty text-slate-500">
            Protección de Menores y estudiantes K-12
          </p>

          <dl className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-card p-6 text-sm shadow-sm sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-slate-900">Responsable</dt>
              <dd className="mt-1 text-slate-600">Arka Universidad Digital S.A. de C.V.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Domicilio</dt>
              <dd className="mt-1 text-slate-600">Chihuahua, México.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Derechos ARCO</dt>
              <dd className="mt-1 flex flex-col text-slate-600">
                <a href="mailto:privacidad@ppgrillo.io" className="text-primary hover:underline">
                  privacidad@ppgrillo.io
                </a>
                <a href="mailto:legal@arka.edu.mx" className="text-primary hover:underline">
                  legal@arka.edu.mx
                </a>
              </dd>
            </div>
          </dl>
        </header>

        <div className="mt-8 space-y-5">
          <Section icon={Database} title="1. Datos que recabamos">
            <p>
              <strong className="text-slate-800">Datos del padre, madre o tutor:</strong> Nombre,
              correo electrónico y número de teléfono (para facturación y envío del reporte
              dominical de avance).
            </p>
            <p>
              <strong className="text-slate-800">Datos del estudiante:</strong> Nombre o apodo,
              grado escolar, mensajes de texto, audios e imágenes de cuadernos/libros escolares
              enviados para resolver dudas académicas.
            </p>
          </Section>

          <Section icon={Target} title="2. Finalidad del tratamiento">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Proveer el servicio de tutoría pedagógica socrática mediante inteligencia
                artificial.
              </li>
              <li>
                Generar resúmenes de hábitos de estudio y progreso académico para los tutores
                legales.
              </li>
              <li>
                No vendemos, no comercializamos ni utilizamos los datos de los menores para fines
                publicitarios o perfiles comerciales de terceros.
              </li>
            </ul>
          </Section>

          <Section icon={Cloud} title="3. Proveedores de Infraestructura y Procesamiento de IA">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                El procesamiento de lenguaje, imágenes y audio se realiza a través de la
                infraestructura empresarial de Google Cloud Platform (Vertex AI).
              </li>
              <li>
                Conforme a las políticas empresariales de Google Cloud, los datos, textos e imágenes
                enviados por los usuarios <strong className="text-slate-800">NO</strong> se utilizan
                para re-entrenar modelos públicos de inteligencia artificial.
              </li>
            </ul>
          </Section>

          <Section icon={Users} title="4. Consentimiento Parental y Protección de Menores">
            <p>
              El registro y la suscripción deben ser realizados o autorizados expresamente por el
              padre, madre o tutor legal del menor conforme a la{' '}
              <strong className="text-slate-800">LFPDPPP</strong> y estándares internacionales{' '}
              <strong className="text-slate-800">(COPPA)</strong>.
            </p>
          </Section>

          <Section icon={KeyRound} title="5. Derechos ARCO">
            <p>
              El tutor legal puede en cualquier momento solicitar el Acceso, Rectificación,
              Cancelación u Oposición del historial de su hijo enviando un correo a{' '}
              <a href="mailto:privacidad@ppgrillo.io" className="text-primary hover:underline">
                privacidad@ppgrillo.io
              </a>
              . La eliminación de los registros asociados se efectuará en un plazo máximo de{' '}
              <strong className="text-slate-800">48 horas hábiles</strong>.
            </p>
          </Section>
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-8 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} PpGrillo · Arka Universidad Digital S.A. de C.V.
          </p>
        </footer>
      </div>
    </main>
  )
}
