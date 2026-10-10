import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'
import { AnimatedChat, type ChatMessage } from '@/components/campaign/animated-chat'

export type { ChatMessage }

type CampaignLandingProps = {
  headline: string
  subhead: string
  chat: ChatMessage[]
  footerHref: string
  footerLabel: string
  ctaHref?: string
  ctaLabel?: string
  ctaNote?: string
}

function BrandLogo() {
  return (
    <div className="flex flex-col items-center leading-none" aria-label="PpGrillo, powered by Google">
      <span className="font-display text-3xl font-extrabold tracking-tight">
        <span style={{ color: '#EA4335' }}>P</span>
        <span style={{ color: '#34A853' }}>p</span>
        <span style={{ color: '#4285F4' }}>Grill</span>
        <span style={{ color: '#FBBC05' }}>o</span>
      </span>
      <span className="mt-1 text-[11px] font-medium text-slate-500" aria-hidden="true">
        powered by{' '}
        <span className="font-semibold">
          <span style={{ color: '#4285F4' }}>G</span>
          <span style={{ color: '#EA4335' }}>o</span>
          <span style={{ color: '#FBBC05' }}>o</span>
          <span style={{ color: '#4285F4' }}>g</span>
          <span style={{ color: '#34A853' }}>l</span>
          <span style={{ color: '#EA4335' }}>e</span>
        </span>
      </span>
    </div>
  )
}

export function CampaignLanding({
  headline,
  subhead,
  chat,
  footerHref,
  footerLabel,
  ctaHref,
  ctaLabel = 'Comenzar prueba gratis de 14 días',
  ctaNote = 'Sin tarjeta bancaria • Cancela cuando quieras',
}: CampaignLandingProps) {
  const isAnchor = footerHref.startsWith('#')

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-between gap-2 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center sm:max-w-lg sm:justify-center sm:gap-2.5">
      <BrandLogo />

      <div className="flex flex-col items-center gap-3">
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-balance text-slate-900 sm:text-4xl">
          {headline}
        </h1>
        <p className="text-base leading-relaxed text-pretty text-slate-600 sm:text-lg">{subhead}</p>
      </div>

      <AnimatedChat messages={chat} />

      <div className="flex w-full flex-col items-center gap-2">
        <WhatsappCta
          href={ctaHref}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-base leading-snug font-bold text-balance min-[400px]:text-lg text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]"
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          {ctaLabel}
        </WhatsappCta>
        <p className="text-sm font-medium text-pretty text-slate-500">{ctaNote}</p>
      </div>

      {isAnchor ? (
        <a href={footerHref} className="group text-sm text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline">
          {footerLabel}
        </a>
      ) : (
        <Link
          href={footerHref}
          className="group inline-flex items-center gap-1 text-sm text-pretty text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
        >
          {footerLabel}
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </section>
  )
}
