import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, GraduationCap, ShieldAlert, CreditCard, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos y Condiciones · PpGrillo',
  description:
    'Términos y Condiciones de Uso de PpGrillo (Arka Universidad Digital S.A. de C.V.): naturaleza del servicio, uso aceptable, suscripción, periodo de prueba y limitación de responsabilidad.',
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

export default function TerminosPage() {
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
              <FileText className="h-3.5 w-3.5" />
              Términos de uso
            </span>
          </div>
          <h1 className="mt-5 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Términos y Condiciones de Uso
          </h1>

          <dl className="mt-6 rounded-2xl border border-slate-200 bg-card p-6 text-sm shadow-sm">
            <dt className="font-semibold text-slate-900">Titular del Servicio</dt>
            <dd className="mt-1 text-slate-600">Arka Universidad Digital S.A. de C.V.</dd>
          </dl>
        </header>

        <div className="mt-8 space-y-5">
          <Section icon={GraduationCap} title="1. Naturaleza del Servicio">
            <p>
              PpGrillo es un asistente educativo complementario de razonamiento socrático impulsado
              por inteligencia artificial. Su propósito es guiar al estudiante mediante preguntas y
              pistas para fomentar el pensamiento crítico.{' '}
              <strong className="text-slate-800">
                No sustituye la enseñanza formal de una institución escolar ni la supervisión de
                tutores.
              </strong>
            </p>
          </Section>

          <Section icon={ShieldAlert} title="2. Uso Aceptable y Seguridad">
            <p>
              El servicio está destinado exclusivamente a fines académicos y de estudio escolar.
              Queda estrictamente prohibido introducir contenido que viole derechos de terceros,
              contenido inapropiado, violento o información confidencial.
            </p>
            <p>
              PpGrillo cuenta con filtros de seguridad pedagógicos que rechazarán consultas fuera
              del ámbito educativo.
            </p>
          </Section>

          <Section icon={CreditCard} title="3. Suscripción, Periodo de Prueba y Cancelación">
            <ul className="list-disc space-y-2 pl-5">
              <li>El servicio ofrece un periodo de prueba gratuito de 14 días.</li>
              <li>
                Tras la prueba, la suscripción mensual recurrente es de{' '}
                <strong className="text-slate-800">$20.00 MXN</strong>, gestionada a través de la
                pasarela de pagos de Mercado Pago.
              </li>
              <li>
                El usuario puede cancelar la domiciliación en cualquier momento desde su cuenta de
                Mercado Pago o solicitándolo a nuestro equipo de soporte sin penalización.
              </li>
            </ul>
          </Section>

          <Section icon={Scale} title="4. Limitación de Responsabilidad">
            <p>
              Aunque los modelos pedagógicos se actualizan continuamente, los sistemas basados en IA
              pueden generar imprecisiones. Arka Universidad Digital no se hace responsable de
              calificaciones escolares ni de decisiones tomadas a partir de las respuestas del
              tutor.
            </p>
          </Section>
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-8 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Arka Universidad Digital S.A. de C.V. Todos los derechos
            reservados.
          </p>
        </footer>
      </div>
    </main>
  )
}
