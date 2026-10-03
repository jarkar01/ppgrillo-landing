'use client'

import { ArrowRight } from 'lucide-react'
import { useOpenSignup } from '@/components/estudiantes/signup-modal'

export function MobileStickyCta({
  legend = 'Sin tarjeta bancaria · WhatsApp oficial',
}: {
  legend?: string
}) {
  const openSignup = useOpenSignup()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-card/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur-md md:hidden">
      <button
        type="button"
        onClick={openSignup}
        className="flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-base font-bold text-white shadow-md shadow-emerald-600/25 transition-colors hover:bg-[#20bd5a] active:scale-[0.99]"
      >
        Probar 14 días gratis
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </button>
      <p className="mt-1.5 text-center text-xs font-medium text-slate-500">
        {legend}
      </p>
    </div>
  )
}
