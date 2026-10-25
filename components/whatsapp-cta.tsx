import type { ReactNode } from 'react'
import { WHATSAPP_TRIAL_URL } from '@/lib/whatsapp'

export function WhatsappCta({
  className,
  children,
  href = WHATSAPP_TRIAL_URL,
}: {
  className?: string
  children: ReactNode
  href?: string
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
