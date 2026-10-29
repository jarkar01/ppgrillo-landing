import type { Metadata } from 'next'
import { BrandFonts } from '@/components/brand-fonts'
import { CampaignLanding } from '@/components/campaign/campaign-landing'

export const metadata: Metadata = {
  title: 'PpGrillo · Tu tutor 24/7',
  description: 'Manda foto de tu tarea y sal de la duda. Pistas paso a paso, sin respuestas regaladas. Empieza gratis.',
}

export default function EstudiantesPage() {
  return (
    <BrandFonts>
      <main className="min-h-svh bg-background">
        <CampaignLanding
          headline="Tu tutor 24/7, sin descargar nada."
          subhead="Manda foto de tu tarea y sal de la duda. Solo escribe tu nombre y empieza."
          chat={[
            { from: 'student', text: 'Me trabé en este, ¿me ayudas?', withPhoto: true },
            { from: 'tutor', text: '¡Claro! Antes de despejar la x, ¿qué número está estorbando de su lado?' },
          ]}
          footerHref="/metodo"
          footerLabel="Conoce la metodología y el servicio"
          compact
        />
      </main>
    </BrandFonts>
  )
}
