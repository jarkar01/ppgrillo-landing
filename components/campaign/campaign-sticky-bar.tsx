'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Share2 } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'

export function CampaignStickyBar({ chatHref, shareHref }: { chatHref: string; shareHref: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-card/90 px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur-md transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-md gap-2">
        <WhatsappCta
          href={chatHref}
          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#20bd5a]"
        >
          <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Chatear
        </WhatsappCta>
        <WhatsappCta
          href={shareHref}
          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#25D366] bg-emerald-50/60 px-3 text-sm font-medium text-[#128C7E] transition-colors hover:bg-emerald-50"
        >
          <Share2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Recomendar
        </WhatsappCta>
      </div>
    </div>
  )
}
