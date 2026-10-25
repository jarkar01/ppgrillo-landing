import type { Metadata } from 'next'
import { LegacyTransition } from '@/components/legacy-transition'

export const metadata: Metadata = {
  title: 'PpGrillo ahora está en WhatsApp',
  description: 'Ya no necesitas iniciar sesión: PpGrillo te acompaña directamente en WhatsApp.',
  robots: { index: false, follow: true },
}

export default function LegacyLoginPage() {
  return <LegacyTransition />
}
