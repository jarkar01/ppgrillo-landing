import { ChevronRight } from 'lucide-react'

export function ArkaSeal({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-card px-4 py-2.5 shadow-sm ${className}`}
    >
      <span className="flex items-center gap-1 rounded-lg bg-[#E50914] px-2 py-1" aria-hidden="true">
        <span className="font-display text-sm font-extrabold tracking-tight text-white">Arka</span>
        <span className="flex items-center -space-x-1.5 text-white">
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </span>
      <span className="text-sm font-semibold text-slate-700">
        Diseñado y respaldado por Arka Universidad
      </span>
    </div>
  )
}
