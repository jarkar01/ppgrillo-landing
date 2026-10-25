import { BrandFonts } from '@/components/brand-fonts'
import { CampaignLanding } from '@/components/campaign/campaign-landing'
import { PARENT_SOCRATIC_DIALOGUE } from '@/lib/socratic-dialogue'
import { WHATSAPP_SHARE_CONTACT_URL, WHATSAPP_TRIAL_URL } from '@/lib/whatsapp'

export default function Page() {
  return (
    <BrandFonts>
      <main className="min-h-svh bg-background">
        <CampaignLanding
          headline="Deja de pelear por la tarea. Recupera la paz de tus tardes."
          subhead="Tu hijo aprende a razonar paso a paso por WhatsApp. Sin descargar apps ni crear cuentas."
          chat={PARENT_SOCRATIC_DIALOGUE}
          ctaHref={WHATSAPP_TRIAL_URL}
          ctaLabel="Chatear / Guardar en este celular"
          secondaryHref={WHATSAPP_SHARE_CONTACT_URL}
          secondaryLabel="Recomendar PpGrillo con un amigo"
          ctaNote="+52 56 4971 2244 • Sin tarjeta • Acceso inmediato"
          footerHref="/metodo"
          footerLabel="Conoce la metodología y el servicio"
          compact
        />
      </main>
    </BrandFonts>
  )
}
