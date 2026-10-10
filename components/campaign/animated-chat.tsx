'use client'

import Image from 'next/image'
import { RotateCcw } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'

export type ChatMessage = {
  from: 'student' | 'tutor'
  text: string
  withPhoto?: boolean
}

const TYPING_MS = { student: 900, tutor: 1300 } as const
const PAUSE_BETWEEN_MS = 1500
const FIRST_MESSAGE_DELAY_MS = 500

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  )
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

function ChatBubble({ from, text, withPhoto }: ChatMessage) {
  if (from === 'student') {
    return (
      <div className="ml-auto flex max-w-[78%] flex-col gap-1 rounded-xl rounded-tr-sm bg-[#d9fdd3] p-1.5 shadow-sm">
        {withPhoto ? (
          <Image
            src="/notebook-equation.png"
            alt="Foto del cuaderno escolar con un ejercicio de suma de fracciones"
            width={220}
            height={110}
            className="h-28 w-full rounded-lg object-cover sm:h-32"
            priority
          />
        ) : null}
        <p className="px-1 text-left text-sm leading-snug text-slate-800">{text}</p>
      </div>
    )
  }

  return (
    <p className="mr-auto max-w-[85%] rounded-xl rounded-tl-sm bg-card px-3 py-2 text-left text-sm leading-snug text-slate-800 shadow-sm">
      {text}
    </p>
  )
}

export function AnimatedChat({ messages, fitViewport = false }: { messages: ChatMessage[]; fitViewport?: boolean }) {
  const reducedMotion = usePrefersReducedMotion()
  const [revealed, setRevealed] = useState(0)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (reducedMotion) return

    if (revealed >= messages.length) return

    let timer: ReturnType<typeof setTimeout>
    if (typing) {
      timer = setTimeout(() => {
        setRevealed((count) => count + 1)
        setTyping(false)
      }, TYPING_MS[messages[revealed].from])
    } else {
      timer = setTimeout(() => setTyping(true), revealed === 0 ? FIRST_MESSAGE_DELAY_MS : PAUSE_BETWEEN_MS)
    }
    return () => clearTimeout(timer)
  }, [reducedMotion, revealed, typing, messages])

  const visibleCount = reducedMotion ? messages.length : revealed
  const typingIndex = !reducedMotion && typing ? revealed : -1
  const tutorIsTyping = typingIndex >= 0 && messages[typingIndex]?.from === 'tutor'
  const finished = !reducedMotion && revealed >= messages.length

  function replay() {
    setTyping(false)
    setRevealed(0)
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-1 sm:max-w-md">
    <figure
      className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-xl shadow-slate-900/10"
      aria-label="Ejemplo de conversación con PpGrillo en WhatsApp"
    >
      <div className="flex items-center gap-2 bg-[#128C7E] px-3 py-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs font-extrabold text-[#128C7E]">
          Pp
        </span>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-sm font-semibold text-white">PpGrillo</span>
          <span className="text-[11px] text-white/80" aria-hidden="true">
            {tutorIsTyping ? 'escribiendo...' : 'en línea'}
          </span>
        </div>
      </div>

      <ol className="sr-only">
        {messages.map((message, index) => (
          <li key={index}>
            {message.from === 'student' ? 'Alumno' : 'PpGrillo'}: {message.text}
          </li>
        ))}
      </ol>

      <ol
        className={`flex ${
          fitViewport ? 'h-[clamp(11rem,calc(100svh-30rem),32rem)] sm:h-[clamp(11rem,calc(100svh-35.5rem),32rem)]' : 'h-[clamp(22rem,58svh,32rem)]'
        } flex-col justify-end gap-2 overflow-hidden bg-[#efeae2] p-3.5`}
        aria-hidden="true"
      >
        {messages.slice(0, visibleCount).map((message, index) => (
          <li key={index} className="flex shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ChatBubble {...message} />
          </li>
        ))}
        {typingIndex >= 0 ? (
          <li className="flex shrink-0 animate-in fade-in duration-200">
            <span
              className={`flex h-7 items-center rounded-xl px-3 shadow-sm ${
                messages[typingIndex].from === 'student'
                  ? 'ml-auto rounded-tr-sm bg-[#d9fdd3]'
                  : 'mr-auto rounded-tl-sm bg-card'
              }`}
            >
              <TypingDots />
            </span>
          </li>
        ) : null}
      </ol>
    </figure>
    {reducedMotion ? null : (
      <button
        type="button"
        onClick={replay}
        disabled={!finished}
        aria-hidden={!finished}
        tabIndex={finished ? 0 : -1}
        className={`inline-flex items-center gap-1 text-xs font-medium text-slate-500 underline-offset-4 transition-opacity hover:text-slate-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] ${
          finished ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <RotateCcw className="h-3 w-3 shrink-0" aria-hidden="true" />
        Ver ejemplo de nuevo
      </button>
    )}
    </div>
  )
}
