'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { RotateCcw, Send, Sparkles } from 'lucide-react'
import { PpGrilloWordmark } from '@/components/app/brand-mark'
import { SignupModalContext } from '@/components/estudiantes/signup-modal'
import { ActivationCard } from './activation-card'
import { DEMO_EXAMPLES, type DemoExample } from './demo-examples'

const DEMO_SECTION_ID = 'prueba'

function scrollToDemo() {
  const section = document.getElementById(DEMO_SECTION_ID)
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  section?.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true })
}

/** Lets shared CTAs (sticky bar, pricing) send visitors back to the demo instead of a modal. */
export function GoDemoCtaProvider({ children }: { children: ReactNode }) {
  return <SignupModalContext.Provider value={scrollToDemo}>{children}</SignupModalContext.Provider>
}

type CannedState = { example: DemoExample; done: boolean }

export function GoDemo() {
  const [canned, setCanned] = useState<CannedState | null>(null)
  const [draft, setDraft] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/tutor',
      prepareSendMessagesRequest: ({ id, messages, body }) => ({
        body: { ...body, id, messages, grade: 'Primaria' },
      }),
    }),
  })

  const liveQuestion = messages.find((m) => m.role === 'user')
  const liveReply = messages.find((m) => m.role === 'assistant')
  const liveReplyText =
    liveReply?.parts.map((p) => (p.type === 'text' ? p.text : '')).join('') ?? ''
  const liveBusy = status === 'submitted' || status === 'streaming'

  const hasConversation = canned !== null || liveQuestion !== undefined
  const replyReady = canned ? canned.done : liveReplyText.length > 0 && status === 'ready'

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setCanned(null)
    setMessages([])
    setDraft('')
  }, [setMessages])

  function pickExample(example: DemoExample) {
    reset()
    setCanned({ example, done: false })
    timer.current = setTimeout(() => setCanned({ example, done: true }), 1400)
  }

  function submitDraft() {
    const text = draft.trim()
    if (!text || liveBusy) return
    reset()
    sendMessage({ text })
  }

  return (
    <section
      id={DEMO_SECTION_ID}
      aria-labelledby="go-demo-title"
      className="scroll-mt-20 bg-gradient-to-b from-emerald-50/70 to-background px-4 pb-16 pt-10 sm:pt-16"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Tutor Socrático Inteligente con IA
          </span>
          <h1
            id="go-demo-title"
            className="text-balance font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl"
          >
            Haz la prueba hoy mismo: mira cómo PpGrillo le explica la tarea sin darle la respuesta directa
          </h1>
          <p className="text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            Toca una de las dudas más comunes de primaria y descubre cómo guía paso a paso con paciencia:
          </p>
        </header>

        {!hasConversation && (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-3">
              {DEMO_EXAMPLES.map((example) => (
                <li key={example.id}>
                  <button
                    type="button"
                    onClick={() => pickExample(example)}
                    className="flex w-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 active:translate-y-0"
                  >
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl"
                      aria-hidden="true"
                    >
                      {example.emoji}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                        {example.topic}
                      </span>
                      <span className="text-pretty font-semibold leading-snug text-slate-800">
                        {example.question}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitDraft()
              }}
              className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 sm:flex-row"
            >
              <label htmlFor="go-demo-question" className="sr-only">
                Escribe la duda o tarea de tu hijo
              </label>
              <input
                id="go-demo-question"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
                }}
                placeholder="O escribe aquí la duda o tarea de tu hijo..."
                enterKeyHint="send"
                className="min-h-12 flex-1 rounded-2xl bg-transparent px-3 text-base text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 font-bold text-white transition-colors hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Probar ahora
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        )}

        {hasConversation && (
          <div className="flex flex-col gap-6">
            <ChatWindow
              question={canned ? canned.example.question : textOf(liveQuestion)}
              intro={canned?.example.intro}
              reply={canned ? (canned.done ? canned.example.reply : '') : liveReplyText}
              typing={canned ? !canned.done : liveReplyText.length === 0}
              error={!canned && status === 'error'}
            />

            {replyReady && <ActivationCard />}

            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 self-center rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-white hover:text-slate-800"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Probar otra duda
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function textOf(message: { parts: { type: string; text?: string }[] } | undefined) {
  return message?.parts.map((p) => (p.type === 'text' ? p.text : '')).join('') ?? ''
}

function ChatWindow({
  question,
  intro,
  reply,
  typing,
  error,
}: {
  question: string
  intro?: string
  reply: string
  typing: boolean
  error: boolean
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
        <PpGrilloWordmark className="text-base" />
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          En línea
        </span>
      </div>

      <div className="flex flex-col gap-4 bg-slate-50/60 p-4 sm:p-6" aria-live="polite">
        <p className="max-w-[85%] self-end rounded-3xl rounded-br-lg bg-emerald-500 px-4 py-3 leading-relaxed text-white">
          {question}
        </p>

        {intro && !typing && (
          <p className="animate-in fade-in text-xs font-bold uppercase tracking-wide text-emerald-700">{intro}</p>
        )}

        {error ? (
          <p className="max-w-[90%] rounded-3xl rounded-bl-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            No pudimos conectar con el tutor. Intenta con uno de los ejemplos.
          </p>
        ) : typing ? (
          <div
            className="flex w-fit items-center gap-1.5 rounded-3xl rounded-bl-lg bg-white px-4 py-4 shadow-sm"
            role="status"
          >
            <span className="sr-only">PpGrillo está escribiendo</span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" />
          </div>
        ) : (
          <p className="animate-in fade-in slide-in-from-bottom-2 max-w-[90%] whitespace-pre-line text-pretty rounded-3xl rounded-bl-lg bg-white px-4 py-3 leading-relaxed text-slate-800 shadow-sm duration-500">
            {reply}
          </p>
        )}
      </div>
    </div>
  )
}
