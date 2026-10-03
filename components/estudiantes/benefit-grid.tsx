import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Benefit = {
  icon: LucideIcon
  title: string
  body: string
  color: string
}

type BenefitGridProps = {
  id?: string
  eyebrow: string
  title: string
  benefits: Benefit[]
  tinted?: boolean
  compactMobile?: boolean
  children?: ReactNode
}

export function BenefitGrid({
  id,
  eyebrow,
  title,
  benefits,
  tinted,
  compactMobile,
  children,
}: BenefitGridProps) {
  return (
    <section
      id={id}
      className={cn('scroll-mt-20', tinted && 'border-y border-slate-200/70 bg-secondary/50')}
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-[#4285F4]">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h2>
        </div>

        <ul
          className={cn(
            'grid',
            compactMobile ? 'mt-10 gap-5 md:mt-12 md:gap-6' : 'mt-12 gap-6',
            benefits.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3',
          )}
        >
          {benefits.map(({ icon: Icon, title, body, color }) =>
            compactMobile ? (
              <li
                key={title}
                className="flex gap-4 rounded-3xl border border-slate-200 bg-card p-5 shadow-sm transition-shadow hover:shadow-md md:flex-col md:gap-0 md:p-8"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl md:h-12 md:w-12"
                  style={{ backgroundColor: `${color}1A`, color }}
                >
                  <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5 md:mt-5 md:gap-3">
                  <h3 className="text-pretty font-display text-lg font-bold leading-snug text-slate-900 md:text-xl">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 md:text-base">{body}</p>
                </div>
              </li>
            ) : (
              <li
                key={title}
                className="rounded-3xl border border-slate-200 bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${color}1A`, color }}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{body}</p>
              </li>
            ),
          )}
        </ul>

        {children}
      </div>
    </section>
  )
}
