import Link from 'next/link'
import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

export const PRIMARY_BUTTON =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] bg-[#25D366] px-5 py-2.5 text-[15px] leading-snug font-semibold text-balance text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70'

export const SECONDARY_BUTTON =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366] bg-emerald-50/60 px-5 py-2.5 text-[15px] leading-snug font-semibold text-balance text-[#128C7E] transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]'

/** Opens the chat directly: the first courtesy task needs no sign-up. */
export function StartFreeButton({
  children = 'Empezar gratis',
  variant = 'primary',
}: {
  children?: ReactNode
  variant?: 'primary' | 'secondary'
}) {
  return (
    <Link href="/app" className={variant === 'primary' ? PRIMARY_BUTTON : SECONDARY_BUTTON}>
      <Sparkles className="h-5 w-5 shrink-0" aria-hidden="true" />
      {children}
    </Link>
  )
}
