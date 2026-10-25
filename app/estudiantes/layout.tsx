import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { BrandFonts } from '@/components/brand-fonts'

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

export default function EstudiantesLayout({ children }: { children: ReactNode }) {
  return <BrandFonts>{children}</BrandFonts>
}
