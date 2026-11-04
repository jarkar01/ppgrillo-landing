'use client'

import { usePathname } from 'next/navigation'
import { WebApp } from '@/components/web/register-gate'

// The chat lives in the /app layout so it stays mounted (conversation, photo draft, task meter)
// while the student reads /app/como-funciona on top of it.
export function AppShell({ children }: { children: React.ReactNode }) {
  const onChat = usePathname() === '/app'

  return (
    <>
      <div inert={!onChat} aria-hidden={!onChat}>
        <WebApp />
      </div>
      {children}
    </>
  )
}
