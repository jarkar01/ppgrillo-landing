import type { ReactNode } from 'react'
import Image from 'next/image'
import { Phone, Video, MoreVertical, ChevronLeft, Check, CheckCheck } from 'lucide-react'

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
      <div className="relative max-w-[82%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-800 shadow-sm">
        {children}
        <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-700/70">
          9:41 <CheckCheck className="h-3 w-3" />
        </span>
      </div>
    </div>
  )
}

type WhatsappPhoneProps = {
  statusText?: string
  tag?: string
  children: ReactNode
  className?: string
}

export function WhatsappPhone({
  statusText = 'En línea • Tutor Socrático',
  tag = 'SEP / LATAM',
  children,
  className = '',
}: WhatsappPhoneProps) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[340px] rounded-[2.75rem] border border-slate-200 bg-slate-900 p-2.5 shadow-2xl shadow-emerald-900/15 ${className}`}
    >
      {/* screen */}
      <div className="overflow-hidden rounded-[2.25rem] bg-[#e6ddd4]">
        {/* chat header */}
        <div className="flex items-center gap-2.5 bg-[#075e54] px-3 py-3 text-white">
          <ChevronLeft className="h-5 w-5 shrink-0 opacity-80" aria-hidden="true" />
          <GrilloAvatar className="h-9 w-9 text-sm ring-2 ring-white/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold leading-tight">PpGrillo Tutor</p>
            <p className="flex items-center gap-1.5 truncate text-[11px] text-emerald-100/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {statusText}
            </p>
          </div>
          <Video className="h-5 w-5 opacity-80" aria-hidden="true" />
          <Phone className="h-4 w-4 opacity-80" aria-hidden="true" />
          <MoreVertical className="h-5 w-5 opacity-80" aria-hidden="true" />
        </div>

        {/* tag row */}
        <div className="flex justify-center bg-[#e6ddd4] pt-3">
          <span className="rounded-full bg-[#fdf6c9] px-3 py-1 text-[10px] font-medium text-amber-800 shadow-sm">
            {tag}
          </span>
        </div>

        {/* messages */}
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
