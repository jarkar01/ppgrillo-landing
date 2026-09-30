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
}

export function BenefitGrid({ id, eyebrow, title, benefits, tinted }: BenefitGridProps) {
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

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, body, color }) => (
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
          ))}
        </ul>
      </div>
    </section>
  )
}
