import type { ReactNode } from 'react'
import Image from 'next/image'

function GrilloAvatar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-display font-extrabold ${className}`}
      style={{ backgroundColor: '#4285F4' }}
      aria-hidden="true"
    >
      Pp
    </div>
  )
}

export function IncomingBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="relative max-w-[82%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700 shadow-sm ring-1 ring-black/5">
        {children}
      </div>
    </div>
  )
}

export function OutgoingBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="relative max-w-[82%] rounded-2xl rounded-tr-sm bg-[#4285F4] px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow-sm">
        {children}
      </div>
    </div>
  )
}

type ChatPhoneProps = {
  statusText?: string
  tag?: string
  children: ReactNode
  className?: string
}

export function ChatPhone({
  statusText = 'Tutor Socrático • ppgrillo.io',
  tag = 'SEP / LATAM',
  children,
  className = '',
}: ChatPhoneProps) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[340px] rounded-[2.75rem] border border-slate-200 bg-slate-900 p-2.5 shadow-2xl shadow-slate-900/15 ${className}`}
    >
      <div className="overflow-hidden rounded-[2.25rem] bg-slate-50">
        <div className="flex items-center gap-2.5 border-b border-slate-200 bg-white px-4 py-3">
          <GrilloAvatar className="h-9 w-9 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold leading-tight text-slate-900">
              PpGrillo Tutor
            </p>
            <p className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
              {statusText}
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-3">
          <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[10px] font-medium text-slate-600">
            {tag}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 px-3 py-3.5">{children}</div>
      </div>
    </div>
  )
}

export function NotebookMessage() {
  return (
    <OutgoingBubble>
      <div className="overflow-hidden rounded-lg">
        <Image
          src="/notebook-equation.png"
          alt="Foto de una libreta con el problema 2x + 4 = 12 escrito a mano"
          width={220}
          height={165}
          className="h-auto w-full rounded-lg object-cover"
        />
      </div>
      <p className="mt-1.5">PpGrillo, ¿cuánto vale x? Dímelo rápido porfa.</p>
    </OutgoingBubble>
  )
}
