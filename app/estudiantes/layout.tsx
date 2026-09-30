import type { CSSProperties, ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter, Roboto } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PpGrillo para Estudiantes · Termina tu tarea en la mitad de tiempo',
  description:
    'Tutor socrático en WhatsApp para secundaria y prepa. Pistas paso a paso, sin juicios y con paciencia infinita. Prueba 14 días gratis, sin tarjeta.',
  alternates: { canonical: '/estudiantes' },
  openGraph: {
    title: '¿Atorado con la tarea a las 9 de la noche? · PpGrillo',
    description:
      'Pp Grillo te acompaña paso a paso y te da las pistas clave para que lo entiendas tú solo en 2 minutos.',
    url: '/estudiantes',
    locale: 'es_MX',
    type: 'website',
  },
}

const fontVars = {
  '--route-font-display': 'var(--font-inter), system-ui, sans-serif',
  '--route-font-body': 'var(--font-roboto), var(--font-inter), system-ui, sans-serif',
} as CSSProperties

export default function EstudiantesLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} ${roboto.variable} font-body`} style={fontVars}>
      {children}
    </div>
  )
}
