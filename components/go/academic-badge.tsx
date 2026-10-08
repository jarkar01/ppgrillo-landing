import { GraduationCap } from 'lucide-react'

const ARKA_RED = '#E30613'

function ArkaLogo() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-display text-sm font-extrabold leading-none"
      style={{ backgroundColor: ARKA_RED, color: '#FFFFFF' }}
    >
      Arka
      <span aria-hidden="true" className="tracking-tighter">
        {'>>>'}
      </span>
    </span>
  )
}

export function AcademicBadge() {
  return (
    <div className="flex justify-center">
      <p className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 rounded-2xl border border-slate-200 bg-background px-4 py-2.5 text-center text-xs font-medium text-slate-600 shadow-sm sm:text-sm">
        <GraduationCap className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <span>Respaldado pedagógicamente por</span>
        <span className="inline-flex items-center gap-1.5">
          <ArkaLogo />
          <span className="font-semibold text-slate-800">Universidad Digital</span>
        </span>
      </p>
    </div>
  )
}
