import type { Metadata } from 'next'
import { BrandFonts } from '@/components/brand-fonts'
import { AppShell } from '@/components/web/app-shell'

export const metadata: Metadata = {
  title: 'PpGrillo · Tu tutor',
  description: 'Resuelve tus tareas paso a paso con el tutor socrático de PpGrillo.',
  robots: { index: false, follow: true },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandFonts>
      <main className="min-h-svh bg-background">
        <AppShell>{children}</AppShell>
      </main>
    </BrandFonts>
  )
}
