import type { ReactNode } from 'react'
import Link from 'next/link'

export const WEB_APP_PATH = '/app'

export function StartCta({
  className,
  children,
  href = WEB_APP_PATH,
}: {
  className?: string
  children: ReactNode
  href?: string
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
