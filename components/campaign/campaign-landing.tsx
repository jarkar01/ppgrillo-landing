import Link from 'next/link'
import { ArrowRight, MessageCircle, Share2 } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'
import { BrandIdentity } from '@/components/brand-identity'
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
  secondaryHref?: string
  secondaryLabel?: string
  ctasInStickyBar?: boolean
  compact?: boolean
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
  secondaryHref,
  secondaryLabel,
  ctasInStickyBar = false,
  compact = false,
}: CampaignLandingProps) {
  const isAnchor = footerHref.startsWith('#')

  return (
    <section
      className={`mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-between gap-2 px-5 pt-4 text-center sm:max-w-lg sm:justify-center sm:gap-2.5 ${
        ctasInStickyBar ? 'pb-24' : 'pb-[max(1.25rem,env(safe-area-inset-bottom))]'
      }`}
    >
      <header>
        <BrandIdentity />
      </header>

      <div className={`flex flex-col items-center ${compact ? 'gap-1.5 sm:gap-3' : 'gap-3'}`}>
        <h1
          className={`font-display font-extrabold leading-tight tracking-tight text-balance text-slate-900 sm:text-4xl ${
            compact ? 'text-2xl' : 'text-3xl'
          }`}
        >
          {headline}
        </h1>
        <p
          className={`text-pretty text-slate-600 sm:text-lg ${
            compact ? 'text-sm leading-snug sm:leading-relaxed' : 'text-base leading-relaxed'
          }`}
        >
          {subhead}
        </p>
      </div>

      <AnimatedChat messages={chat} fitViewport={compact} />

      {ctasInStickyBar ? (
        <p className="text-sm font-medium text-pretty text-slate-500">{ctaNote}</p>
      ) : (
      <div className="flex w-full flex-col items-center gap-2">
        <WhatsappCta
          href={ctaHref}
          className="flex min-h-11 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2 text-[15px] leading-snug font-semibold text-balance text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]"
        >
          {secondaryHref ? (
            <Share2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          )}
          {ctaLabel}
        </WhatsappCta>
        {secondaryHref && secondaryLabel ? (
          <WhatsappCta
            href={secondaryHref}
            className="flex min-h-10 w-full max-w-sm items-center justify-center gap-2 rounded-full border border-[#25D366] bg-emerald-50/60 px-5 py-1.5 text-[15px] leading-snug font-medium text-balance text-[#128C7E] transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]"
          >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            {secondaryLabel}
          </WhatsappCta>
        ) : null}
        <p className="text-sm font-medium text-pretty text-slate-500">{ctaNote}</p>
      </div>
      )}

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
