import type { Metadata } from 'next'
import { BrandFonts } from '@/components/brand-fonts'
import { CampaignLanding } from '@/components/campaign/campaign-landing'

export const metadata: Metadata = {
  title: 'PpGrillo · Prueba gratis 14 días por WhatsApp',
  description:
    'Tu hijo aprende a razonar paso a paso por WhatsApp. Sin descargar apps ni crear cuentas. Sin tarjeta bancaria.',
}

export default function GoPage() {
  return (
    <BrandFonts>
      <main className="min-h-svh bg-background">
        <CampaignLanding
          headline="Deja de pelear por la tarea. Recupera la paz de tus tardes."
          subhead="Tu hijo aprende a razonar paso a paso por WhatsApp. Sin descargar apps ni crear cuentas."
          chat={{
            caption: 'Ayúdame con este, porfa',
            reply: '¡Vamos juntos! ¿Qué operación crees que deberíamos resolver primero?',
          }}
          footerHref="/"
          footerLabel="¿Quieres conocer a fondo la metodología y el servicio? Visita ppgrillo.io"
        />
      </main>
    </BrandFonts>
  )
}
