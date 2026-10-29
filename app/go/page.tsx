import type { Metadata } from 'next'
import { BrandFonts } from '@/components/brand-fonts'
import { CampaignLanding } from '@/components/campaign/campaign-landing'
import { PARENT_SOCRATIC_DIALOGUE } from '@/lib/socratic-dialogue'

export const metadata: Metadata = {
  title: 'PpGrillo · Empieza gratis',
  description:
    'Tu hijo aprende a razonar paso a paso. 3 tareas gratis de por vida con solo tu nombre. Sin tarjeta bancaria.',
}

export default function GoPage() {
  return (
    <BrandFonts>
      <main className="min-h-svh bg-background">
        <CampaignLanding
          headline="Deja de pelear por la tarea. Recupera la paz de tus tardes."
          subhead="Tu hijo aprende a razonar paso a paso en nuestro chat web, directo en el navegador. Sin descargar apps ni dar tu teléfono."
          chat={PARENT_SOCRATIC_DIALOGUE}
          footerHref="/metodo"
          footerLabel="Conoce la metodología y el servicio"
          compact
        />
      </main>
    </BrandFonts>
  )
}
