'use client'

import { useEffect, useRef, useState } from 'react'
import type { UIMessage } from 'ai'
import { Send, Camera, X, Menu, Sparkles, Clock, Crown, Lock, LogOut } from 'lucide-react'
import { PpGrilloAvatar } from './brand-mark'
import type { StudentProfile } from './types'

type Status = 'submitted' | 'streaming' | 'ready' | 'error'

const SUGGESTIONS = [
  'Tengo una duda de Matemáticas',
  'Ayúdame a entender este texto',
  'Revisar un problema paso a paso',
] as const

function MessageParts({ message }: { message: UIMessage }) {
  return (
    <>
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          return (
            <span key={i} className="whitespace-pre-wrap">
              {part.text}
            </span>
          )
        }
        if (part.type === 'file' && part.mediaType?.startsWith('image/')) {
          return (
            <img
              key={i}
              src={part.url || '/placeholder.svg'}
              alt="Ejercicio compartido"
              className="mt-1 max-h-52 w-full rounded-xl object-cover"
            />
          )
        }
        return null
      })}
    </>
  )
}

export function TutorChat({
  profile,
  messages,
  status,
  isSubscribed,
  daysLeft,
  locked,
  dailyLimit,
  usedToday,
  dailyLimitReached,
  uploadError,
  onSend,
  onOpenSidebar,
  onLogout,
}: {
  profile: StudentProfile
  messages: UIMessage[]
  status: Status
  isSubscribed: boolean
  daysLeft: number
  locked: boolean
  dailyLimit: number | null
  usedToday: number
  dailyLimitReached: boolean
  uploadError?: string | null
  onSend: (text: string, files?: FileList) => void
  onOpenSidebar: () => void
  onLogout: () => void
}) {
  const firstName = profile.studentName?.trim().split(/\s+/)[0] ?? ''
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<FileList | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const busy = status === 'submitted' || status === 'streaming'
  const inputBlocked = locked || dailyLimitReached
  const remainingToday = dailyLimit === null ? null : Math.max(0, dailyLimit - usedToday)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(files[0])
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [files])

  function clearFiles() {
    setFiles(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy || inputBlocked) return
    if (!input.trim() && (!files || files.length === 0)) return
    onSend(input, files)
    setInput('')
    clearFiles()
  }

  return (
    <div className="flex h-dvh flex-1 flex-col bg-background">
      {/* header */}
      <header className="flex shrink-0 items-center gap-2.5 border-b border-slate-200 bg-card/90 px-3 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md sm:gap-3 sm:px-6 sm:py-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="-ml-1 rounded-full p-2 text-slate-500 transition-colors hover:bg-accent hover:text-primary lg:hidden"
          aria-label="Abrir historial de consultas"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative shrink-0">
          <PpGrilloAvatar className="h-10 w-10" />
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-extrabold leading-tight text-slate-900 sm:text-base">
            {firstName ? `Hola, ${firstName}` : 'PpGrillo'}
          </p>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600">
              <span className="sr-only">PpGrillo está </span>En línea
            </span>
            <span className="text-xs text-slate-300" aria-hidden="true">
              ·
            </span>
            {isSubscribed ? (
              <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-primary">
                <Crown className="h-3 w-3 shrink-0" aria-hidden="true" />
                Plan activo
              </span>
            ) : locked ? (
              <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-red-600">
                <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
                Prueba vencida
              </span>
            ) : (
              <span className="inline-flex min-w-0 items-center gap-1 truncate rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {daysLeft} {daysLeft === 1 ? 'día de prueba activo' : 'días de prueba activos'}
                </span>
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex shrink-0 items-center gap-1.5 rounded-full p-2 text-slate-500 transition-colors hover:bg-accent hover:text-primary sm:px-3"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="hidden text-sm font-medium sm:inline">Salir</span>
        </button>
      </header>

      {/* messages */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-6 sm:py-6"
        role="log"
        aria-live="polite"
        aria-label="Conversación con PpGrillo"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {/* welcome */}
          <div className="flex items-end gap-2.5">
            <PpGrilloAvatar className="h-8 w-8 shrink-0" />
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-card px-4 py-3 text-[15px] leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-100">
              ¡Hola! Estoy listo para ayudarte a pensar y resolver tus dudas paso a paso. ¿Qué ejercicio o materia
              estás repasando hoy?
            </div>
          </div>

          {messages.length === 0 && !inputBlocked && (
            <div className="flex flex-col items-start gap-2 pl-10.5" aria-label="Sugerencias para empezar">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSend(suggestion)}
                  disabled={busy}
                  className="min-h-11 rounded-full border border-primary/30 bg-card px-4 py-2.5 text-left text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-accent active:scale-[0.98] disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === 'user'
            return (
              <div key={m.id} className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                {!isUser && <PpGrilloAvatar className="h-8 w-8 shrink-0" />}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                    isUser
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-card text-slate-700 ring-1 ring-slate-100'
                  }`}
                >
                  <MessageParts message={m} />
                </div>
              </div>
            )
          })}

          {status === 'submitted' && (
            <div className="flex items-end gap-2.5">
              <PpGrilloAvatar className="h-8 w-8 shrink-0" />
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-card px-4 py-4 shadow-sm ring-1 ring-slate-100">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" />
              </div>
            </div>
          )}

          {status === 'error' && (
            <p className="mx-auto rounded-full bg-red-50 px-4 py-2 text-center text-xs font-medium text-red-500">
              Ocurrió un error. Intenta enviar tu mensaje de nuevo.
            </p>
          )}

          {dailyLimitReached && !busy && (
            <div className="flex items-end gap-2.5" role="status">
              <PpGrilloAvatar className="h-8 w-8 shrink-0" />
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-accent px-4 py-3 text-[15px] leading-relaxed text-accent-foreground shadow-sm ring-1 ring-primary/20">
                ¡Gran sesión de estudio hoy! Has alcanzado tu límite diario de {dailyLimit} preguntas de la prueba
                gratuita. Tu tutor descansará y estará listo mañana, o podrás actualizar pronto a un plan ilimitado.
              </div>
            </div>
          )}

          {uploadError && status !== 'error' && (
            <p className="mx-auto rounded-full bg-red-50 px-4 py-2 text-center text-xs font-medium text-red-500">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      {/* input */}
      <div className="shrink-0 border-t border-slate-200 bg-card/95 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-6 sm:py-3">
        <form onSubmit={submit} className="mx-auto max-w-2xl">
          {previewUrl && (
            <div className="mb-2 flex items-center gap-2">
              <div className="relative">
                <img src={previewUrl || '/placeholder.svg'} alt="Vista previa" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" />
                <button
                  type="button"
                  onClick={clearFiles}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-800 p-0.5 text-white shadow"
                  aria-label="Quitar foto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-xs text-slate-400">Foto lista para enviar</span>
            </div>
          )}
          <div className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.length && setFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={inputBlocked}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-accent hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Subir foto de tu libreta o libro"
            >
              <Camera className="h-5 w-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  submit(e)
                }
              }}
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
                }, 300)
              }}
              rows={1}
              enterKeyHint="send"
              disabled={inputBlocked}
              aria-label="Escribe tu duda"
              placeholder={dailyLimitReached ? 'Vuelve mañana para seguir estudiando' : 'Escribe tu duda...'}
              className="max-h-32 min-w-0 flex-1 resize-none bg-transparent py-2.5 text-base text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed sm:text-[15px]"
            />
            <button
              type="submit"
              disabled={busy || inputBlocked || (!input.trim() && (!files || files.length === 0))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              aria-label="Enviar mensaje"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          {remainingToday !== null && remainingToday > 0 && remainingToday <= 5 && (
            <p className="mt-2 text-center text-xs font-medium text-primary" role="status">
              Te {remainingToday === 1 ? 'queda 1 pregunta' : `quedan ${remainingToday} preguntas`} hoy
            </p>
          )}
          <p className="mt-2 hidden items-center justify-center gap-1.5 text-center text-[11px] text-slate-400 sm:flex">
            <Sparkles className="h-3 w-3" />
            PpGrillo te guía con preguntas. No te dará la respuesta directa.
          </p>
          <p className="mx-auto mt-1.5 max-w-xl text-center text-[11px] leading-relaxed text-slate-400">
            PpGrillo fomenta el pensamiento crítico. Consulta nuestro{' '}
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-slate-300 underline-offset-2 transition-colors hover:text-primary"
            >
              Aviso de Privacidad
            </a>{' '}
            y{' '}
            <a
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-slate-300 underline-offset-2 transition-colors hover:text-primary"
            >
              Términos
            </a>
            . El uso del tutor debe estar supervisado por un padre o tutor legal.
          </p>
        </form>
      </div>
    </div>
  )
}
