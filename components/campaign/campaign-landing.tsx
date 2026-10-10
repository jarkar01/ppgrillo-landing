import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'

type ChatMock = {
  caption: string
  reply: string
}

type CampaignLandingProps = {
  headline: string
  subhead: string
  chat: ChatMock
  footerHref: string
  footerLabel: string
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

function ChatMockup({ caption, reply }: ChatMock) {
  return (
    <figure
      className="w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-xl shadow-slate-900/10"
      aria-label="Ejemplo de conversación con PpGrillo en WhatsApp"
    >
      <div className="flex items-center gap-2 bg-[#128C7E] px-3 py-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs font-extrabold text-[#128C7E]">
          Pp
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-white">PpGrillo</span>
          <span className="text-[11px] text-white/80">en línea</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 bg-[#efeae2] p-3">
        <div className="ml-auto flex max-w-[78%] flex-col gap-1 rounded-xl rounded-tr-sm bg-[#d9fdd3] p-1.5 shadow-sm">
          <Image
            src="/notebook-equation.png"
            alt="Foto de una libreta con un ejercicio de matemáticas"
            width={220}
            height={110}
            className="h-20 w-full rounded-lg object-cover"
            priority
          />
          <p className="px-1 text-[13px] leading-snug text-slate-800">{caption}</p>
        </div>
        <p className="mr-auto max-w-[85%] rounded-xl rounded-tl-sm bg-card px-2.5 py-1.5 text-[13px] leading-snug text-slate-800 shadow-sm">
          {reply}
        </p>
      </div>
    </figure>
  )
}

export function CampaignLanding({ headline, subhead, chat, footerHref, footerLabel }: CampaignLandingProps) {
  const isAnchor = footerHref.startsWith('#')

  return (
    <section className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-between gap-5 px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center sm:max-w-lg sm:justify-center sm:gap-7">
      <BrandLogo />

      <div className="flex flex-col items-center gap-3">
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-balance text-slate-900 sm:text-4xl">
          {headline}
        </h1>
        <p className="text-base leading-relaxed text-pretty text-slate-600 sm:text-lg">{subhead}</p>
      </div>

      <ChatMockup {...chat} />

      <div className="flex w-full flex-col items-center gap-2">
        <WhatsappCta className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-4 text-base font-bold whitespace-nowrap min-[400px]:text-lg text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]">
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          Comenzar prueba gratis de 14 días
        </WhatsappCta>
        <p className="text-sm font-medium text-slate-500">Sin tarjeta bancaria • Cancela cuando quieras</p>
      </div>

      {isAnchor ? (
        <a href={footerHref} className="group text-sm text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline">
          {footerLabel}
        </a>
      ) : (
        <Link
          href={footerHref}
          className="group inline-flex items-center gap-1 text-sm text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
        >
          {footerLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </section>
  )
}
