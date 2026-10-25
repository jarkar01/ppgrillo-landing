import { ArrowRight } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'

export function InlineTrialCta({
  label = 'Comenzar prueba gratis para la tarea de hoy',
}: {
  label?: string
}) {
  return (
    <div className="mt-12 flex justify-center">
      <WhatsappCta className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-primary bg-card px-6 py-3 text-center text-base font-bold text-primary transition-colors hover:bg-accent">
        {label}
        <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
      </WhatsappCta>
    </div>
  )
}
