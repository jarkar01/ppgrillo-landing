import { MessageCircle, Share2 } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'

export function CampaignCtaPair({
  chatHref,
  shareHref,
  note,
}: {
  chatHref: string
  shareHref: string
  note?: string
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2.5">
      <WhatsappCta
        href={chatHref}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] bg-[#25D366] px-5 py-2.5 text-[15px] leading-snug font-semibold text-balance text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]"
      >
        <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        Chatear / Guardar en este celular
      </WhatsappCta>
      <WhatsappCta
        href={shareHref}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] bg-emerald-50/60 px-5 py-2.5 text-[15px] leading-snug font-semibold text-balance text-[#128C7E] transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]"
      >
        <Share2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        Recomendar PpGrillo con un amigo
      </WhatsappCta>
      {note ? <p className="text-sm font-medium text-pretty text-slate-500">{note}</p> : null}
    </div>
  )
}
