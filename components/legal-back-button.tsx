'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function LegalBackButton({ fallbackHref = '/go' }: { fallbackHref?: string }) {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Volver
    </button>
  )
}
