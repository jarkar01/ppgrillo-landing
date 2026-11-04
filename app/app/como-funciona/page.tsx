import type { Metadata } from 'next'
import { AppGuide } from '@/components/web/app-guide'

export const metadata: Metadata = {
  title: 'Cómo funciona PpGrillo · Información y planes',
  description: 'Cómo te ayuda el tutor de PpGrillo, qué cuenta como tarea y cuáles son los planes.',
  robots: { index: false, follow: true },
}

export default function ComoFuncionaPage() {
  return <AppGuide />
}
