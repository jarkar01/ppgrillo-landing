import { cn } from '@/lib/utils'

const GOOGLE_LETTERS = [
  ['G', '#4285F4'],
  ['o', '#EA4335'],
  ['o', '#FBBC05'],
  ['g', '#4285F4'],
  ['l', '#34A853'],
  ['e', '#EA4335'],
] as const

function GoogleWordmark() {
  return (
    <span className="font-bold">
      {GOOGLE_LETTERS.map(([letter, color], i) => (
        <span key={i} style={{ color }}>
          {letter}
        </span>
      ))}
    </span>
  )
}

export function PpGrilloWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-extrabold leading-none tracking-tight', className)}>
      <span style={{ color: '#EA4335' }}>P</span>
      <span style={{ color: '#34A853' }}>p</span>
      <span style={{ color: '#4285F4' }}>Grill</span>
      <span style={{ color: '#FBBC05' }}>o</span>
    </span>
  )
}

type BrandIdentityProps = {
  align?: 'center' | 'start'
  className?: string
}

export function BrandIdentity({ align = 'center', className }: BrandIdentityProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
      aria-label="PpGrillo, powered by Google y Arka Universidad"
      role="img"
    >
      <PpGrilloWordmark className="text-2xl sm:text-3xl" />
      <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-0.5 text-xs font-medium whitespace-nowrap text-slate-600 shadow-sm sm:text-sm">
        <span>powered by</span>
        <GoogleWordmark />
        <span className="text-slate-300" aria-hidden="true">
          {'•'}
        </span>
        <span className="font-bold text-[#E50914]">Arka</span>
        <span className="font-semibold text-slate-700">Universidad</span>
      </span>
    </div>
  )
}

export function CollaborationNote({ className }: { className?: string }) {
  return (
    <p className={cn('text-sm leading-relaxed text-pretty text-slate-600', className)}>
      <span className="font-bold text-slate-800">PpGrillo</span>
      {' — Una colaboración pedagógica y tecnológica entre '}
      <span className="font-semibold text-[#E50914]">Arka Universidad</span>
      {' y '}
      <span className="font-semibold text-[#4285F4]">Google</span>.
    </p>
  )
}
