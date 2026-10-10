import type { ReactNode } from 'react'
import { WHATSAPP_TRIAL_URL } from '@/lib/whatsapp'

export function WhatsappCta({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a href={WHATSAPP_TRIAL_URL} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
