import type { Metadata } from 'next'
import { BrandFonts } from '@/components/brand-fonts'
import { CampaignLanding } from '@/components/campaign/campaign-landing'
import { PARENT_SOCRATIC_DIALOGUE } from '@/lib/socratic-dialogue'
import { WHATSAPP_SHARE_CONTACT_URL } from '@/lib/whatsapp'

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
          chat={PARENT_SOCRATIC_DIALOGUE}
          ctaHref={WHATSAPP_SHARE_CONTACT_URL}
          ctaLabel="Enviar contacto de PpGrillo por WhatsApp"
          ctaNote="O agrégalo directo a tus contactos: +52 56 5433 8979 • 14 días gratis • Sin tarjeta"
          footerHref="/metodo"
          footerLabel="¿Quieres conocer a fondo la metodología y el servicio? Conoce más aquí"
        />
      </main>
    </BrandFonts>
  )
}
