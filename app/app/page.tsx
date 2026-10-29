import type { Metadata } from 'next'
import { BrandFonts } from '@/components/brand-fonts'
import { WebApp } from '@/components/web/register-gate'

export const metadata: Metadata = {
  title: 'PpGrillo · Tu tutor',
  description: 'Resuelve tus tareas paso a paso con el tutor socrático de PpGrillo.',
  robots: { index: false, follow: true },
}

export default function AppPage() {
  return (
    <BrandFonts>
      <main className="min-h-svh bg-background">
        <WebApp />
      </main>
    </BrandFonts>
  )
}
