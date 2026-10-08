'use client'

import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { PpGrilloAvatar } from '@/components/app/brand-mark'

type Line =
  | { at: number; from: 'student' | 'tutor'; text: string }
  | { at: number; from: 'thinking'; until: number }

const SCRIPT: Line[] = [
  {
    at: 0,
    from: 'student',
    text: 'PpGrillo, no le entiendo a las fracciones. Tengo que sumar 1/2 + 1/4 y no me sale 😭',
  },
  { at: 4500, from: 'thinking', until: 7000 },
  {
    at: 7000,
    from: 'tutor',
    text: '¡Tranqui, que esto se resuelve con comida! 🍕 Imagina una pizza entera. Si tienes media pizza, ¿cuántas rebanadas de un cuarto le caben a esa mitad?',
  },
  { at: 13000, from: 'student', text: 'Mmm... ¡caben 2 rebanadas de un cuarto!' },
  {
    at: 16500,
    from: 'tutor',
    text: '¡Esooo! 🎉 Entonces ya tienes 2 cuartos... más el otro cuarto que te pide la tarea, ¿cuántos cuartos son en total? ¡Ya casi la tienes!',
  },
  { at: 21000, from: 'student', text: '¡Son 3 cuartos! 😱 ¡Ya entendí, gracias!' },
  { at: 24000, from: 'tutor', text: '¡Brillante! Lo lograste tú solito 🌟' },
]

const END_AT = Math.max(...SCRIPT.map((l) => ('until' in l ? l.until : l.at)))

export function ChatReplay() {
  const [elapsed, setElapsed] = useState(0)
  const [runId, setRunId] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setElapsed(END_AT)
      return
    }
    setElapsed(0)
    const timers = [...new Set(SCRIPT.flatMap((l) => ('until' in l ? [l.at, l.until] : [l.at])))].map(
      (t) => setTimeout(() => setElapsed(t), t),
    )
    return () => timers.forEach(clearTimeout)
  }, [runId])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [elapsed])

  const visible = SCRIPT.filter((l) => l.at <= elapsed && (!('until' in l) || elapsed < l.until))
  const finished = elapsed >= END_AT

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-sm rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-emerald-900/20">
        <div className="flex flex-col overflow-hidden rounded-[1.9rem] bg-[#F3F7F4]">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <PpGrilloAvatar className="h-9 w-9" />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold text-slate-900">PpGrillo</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Tutor en línea
              </span>
            </div>
          </div>

          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-label="Conversación de ejemplo entre un alumno y PpGrillo"
            className="flex h-[23rem] flex-col gap-2.5 overflow-y-auto px-3 py-4"
          >
            {visible.map((line) =>
              line.from === 'thinking' ? (
                <p
                  key={`thinking-${line.at}`}
                  className="animate-in fade-in self-start rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm italic text-slate-500 shadow-sm duration-300"
                >
                  🦗 PpGrillo está pensando
                  <span className="inline-flex w-5 animate-pulse">...</span>
                </p>
              ) : (
                <p
                  key={line.at}
                  className={`animate-in fade-in slide-in-from-bottom-2 max-w-[85%] text-pretty rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm duration-300 ${
                    line.from === 'student'
                      ? 'self-end rounded-br-md bg-emerald-500 text-white'
                      : 'self-start rounded-bl-md bg-white text-slate-800'
                  }`}
                >
                  <span className="sr-only">{line.from === 'student' ? 'Alumno: ' : 'PpGrillo: '}</span>
                  {line.text}
                </p>
              ),
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setRunId((n) => n + 1)}
        disabled={!finished}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:opacity-0"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Ver de nuevo
      </button>
    </div>
  )
}
