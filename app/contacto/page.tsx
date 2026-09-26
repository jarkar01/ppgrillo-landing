import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, Clock, ShieldCheck, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto · PpGrillo',
  description:
    'Contacta a PpGrillo (Arka Universidad Digital S.A. de C.V.) para dudas, soporte y el ejercicio de tus derechos ARCO. Escríbenos a legal@arka.edu.mx.',
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

function Card({
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
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <header className="mt-8">
          <Brand />
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl">
            Contacto y atención
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600">
            Estamos para ayudarte. Escríbenos para resolver dudas sobre el servicio, soporte de la
            tutoría o para ejercer tus derechos de privacidad.
          </p>
        </header>

        <div className="mt-10 space-y-6">
          <Card icon={Mail} title="Correo de atención">
            <p>
              Puedes escribirnos directamente a nuestro correo oficial de atención:
            </p>
            <a
              href="mailto:legal@arka.edu.mx"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <Mail className="h-4 w-4" />
              legal@arka.edu.mx
            </a>
          </Card>

          <Card icon={HelpCircle} title="Dudas y soporte">
            <p>
              Si tienes preguntas sobre el funcionamiento del tutor socrático, tu suscripción, el
              periodo de prueba de 14 días o los métodos de pago (Mercado Pago), inclúyelas en tu
              mensaje con el mayor detalle posible para poder ayudarte mejor.
            </p>
          </Card>

          <Card icon={ShieldCheck} title="Ejercicio de derechos ARCO">
            <p>
              Como titular de datos personales, tienes derecho a <strong>Acceder</strong>,{' '}
              <strong>Rectificar</strong>, <strong>Cancelar</strong> u <strong>Oponerte</strong> al
              tratamiento de tus datos (derechos ARCO), conforme a la LFPDPPP.
            </p>
            <p>
              Para ejercerlos, envía tu solicitud a{' '}
              <a
                href="mailto:legal@arka.edu.mx"
                className="font-semibold text-primary hover:underline"
              >
                legal@arka.edu.mx
              </a>{' '}
              indicando tu nombre, la cuenta asociada y el derecho que deseas ejercer. Consulta más
              detalles en nuestro{' '}
              <Link href="/privacidad" className="font-semibold text-primary hover:underline">
                Aviso de Privacidad
              </Link>
              .
            </p>
          </Card>

          <Card icon={Clock} title="Tiempos de respuesta">
            <p>
              Atendemos las solicitudes en un plazo máximo de <strong>48 horas hábiles</strong>. Las
              solicitudes de eliminación de datos se procesan dentro de ese mismo periodo.
            </p>
          </Card>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-card p-6 text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-900">Arka Universidad Digital S.A. de C.V.</p>
          <p className="mt-1">Chihuahua, México</p>
        </div>

        <footer className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-6">
          <Link
            href="/privacidad"
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
          >
            Aviso de Privacidad
          </Link>
          <Link
            href="/terminos"
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
          >
            Términos del Servicio
          </Link>
        </footer>
      </div>
    </main>
  )
}
