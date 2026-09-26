import type { Metadata } from 'next'
import { TutorApp } from '@/components/app/tutor-app'

export const metadata: Metadata = {
  title: 'Tutoría con PpGrillo',
  description: 'Espacio de tutoría socrática de PpGrillo. Aprende a pensar paso a paso.',
}

export default function AppPage() {
  return <TutorApp />
}
