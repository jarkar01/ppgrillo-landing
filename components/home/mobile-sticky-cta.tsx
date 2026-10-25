'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { WhatsappCta } from '@/components/whatsapp-cta'

export function MobileStickyCta({
  legend = 'Sin tarjeta bancaria · WhatsApp oficial',
  revealAfterHero = false,
}: {
  legend?: string
  revealAfterHero?: boolean
}) {
  const [visible, setVisible] = useState(!revealAfterHero)

  useEffect(() => {
    if (!revealAfterHero) return
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [revealAfterHero])

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-card/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur-md transition-transform duration-300 md:hidden ${
          visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
        aria-hidden={!visible}
      >
        <WhatsappCta className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-base font-bold text-white shadow-md shadow-emerald-600/25 transition-colors hover:bg-[#20bd5a] active:scale-[0.99]">
          Probar 14 días gratis
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </WhatsappCta>
        <p className="mt-1.5 text-center text-xs font-medium text-slate-500">{legend}</p>
      </div>

      {revealAfterHero && (
        <div
          className={`fixed inset-x-0 bottom-6 z-40 hidden justify-center transition-all duration-300 md:flex ${
            visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
          }`}
          aria-hidden={!visible}
        >
          <WhatsappCta className="flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-[#20bd5a]">
            Comenzar prueba gratis de 14 días
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </WhatsappCta>
        </div>
      )}
    </>
  )
}
