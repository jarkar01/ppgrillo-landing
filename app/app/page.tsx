import type { Metadata } from 'next'
import { LegacyTransition } from '@/components/legacy-transition'

export const metadata: Metadata = {
  title: 'PpGrillo ahora está en WhatsApp',
  description: 'Tu tutor PpGrillo y tus días de prueba continúan directamente en WhatsApp.',
  robots: { index: false, follow: true },
}

export default function LegacyAppPage() {
  return <LegacyTransition />
}
