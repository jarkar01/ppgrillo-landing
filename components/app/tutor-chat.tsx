'use client'

import { useEffect, useRef, useState } from 'react'
import type { UIMessage } from 'ai'
import { Send, ImagePlus, X, Menu, Sparkles, Clock, Crown, Lock } from 'lucide-react'
import { PpGrilloAvatar } from './brand-mark'
import type { StudentProfile } from './types'

type Status = 'submitted' | 'streaming' | 'ready' | 'error'

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
  onSend,
  onOpenSidebar,
}: {
  profile: StudentProfile
  messages: UIMessage[]
  status: Status
  isSubscribed: boolean
  daysLeft: number
  locked: boolean
  onSend: (text: string, files?: FileList) => void
  onOpenSidebar: () => void
}) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<FileList | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const busy = status === 'submitted' || status === 'streaming'

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
    if (busy || locked) return
    if (!input.trim() && (!files || files.length === 0)) return
    onSend(input, files)
    setInput('')
    clearFiles()
  }

  return (
    <div className="flex h-dvh flex-1 flex-col bg-background">
      {/* header */}
      <header className="flex items-center gap-3 border-b border-slate-200 bg-card/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-full p-2 text-slate-500 transition-colors hover:bg-accent hover:text-primary lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <PpGrilloAvatar className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-extrabold text-slate-900">PpGrillo</p>
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Tutor Socrático en línea
          </span>
        </div>
        {isSubscribed ? (
          <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary sm:inline-flex">
            <Crown className="h-3.5 w-3.5" />
            Plan Activo
          </span>
        ) : locked ? (
          <span className="hidden items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 sm:inline-flex">
            <Lock className="h-3.5 w-3.5" />
            Prueba vencida
          </span>
        ) : (
          <span className="hidden items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground sm:inline-flex">
            <Clock className="h-3.5 w-3.5" />
            Prueba: {daysLeft} {daysLeft === 1 ? 'día restante' : 'días restantes'}
          </span>
        )}
      </header>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {/* welcome */}
          <div className="flex items-end gap-2.5">
            <PpGrilloAvatar className="h-8 w-8 shrink-0" />
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-card px-4 py-3 text-[15px] leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-100">
              ¡Hola{profile.studentName ? `, ${profile.studentName}` : ''}! Soy PpGrillo, tu tutor.
              No estoy aquí para darte las respuestas, sino para ayudarte a descubrirlas tú mismo.{' '}
              Cuéntame tu duda o mándame una foto de tu ejercicio y lo resolvemos juntos, paso a paso. ¿Con qué empezamos hoy?
            </div>
          </div>

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
        </div>
      </div>

      {/* input */}
      <div className="border-t border-slate-200 bg-card/80 px-4 py-3 backdrop-blur-md sm:px-6">
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
              className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-accent hover:text-primary"
              aria-label="Adjuntar foto del ejercicio"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  submit(e)
                }
              }}
              rows={1}
              placeholder="Escribe tu duda o problema..."
              className="max-h-32 flex-1 resize-none bg-transparent py-2 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={busy || (!input.trim() && (!files || files.length === 0))}
              className="rounded-full bg-primary p-2.5 text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-40"
              aria-label="Enviar"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <Sparkles className="h-3 w-3" />
            PpGrillo te guía con preguntas. No te dará la respuesta directa.
          </p>
        </form>
      </div>
    </div>
  )
}
