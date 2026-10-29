import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function LegalBackButton({ href = '/' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Volver al inicio
    </Link>
  )
}
