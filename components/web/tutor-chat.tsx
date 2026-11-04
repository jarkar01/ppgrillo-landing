'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type FileUIPart } from 'ai'
import Link from 'next/link'
import { useCallback, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Camera, Info, Loader2, SendHorizontal, X } from 'lucide-react'
import { BrandIdentity } from '@/components/brand-identity'

const GUIDE_PATH = '/app/como-funciona'
import { ChatPaywall } from '@/components/web/chat-paywall'
import { EmailLogin } from '@/components/web/email-login'
import {
  ActivatedNotice,
  ActivationCard,
  PaymentFailedNotice,
  PlanBadge,
} from '@/components/web/subscription-status'
import { useSubscription } from '@/lib/use-subscription'
import { compressImage } from '@/components/app/compress-image'
import { readLocalStudent, updateLocalStudent } from '@/lib/local-student'
import { FREE_LIFETIME_TASKS } from '@/lib/plans'
import {
  TASK_COMPLETE_MARKER,
  stripTaskMarker,
  type TutorMessage,
  type TutorStudentState,
} from '@/lib/tutor-types'

function TaskMeter({ used }: { used: number }) {
  const left = Math.max(0, FREE_LIFETIME_TASKS - used)
  return (
    <div className="flex items-center gap-2" aria-label={`Te quedan ${left} de ${FREE_LIFETIME_TASKS} tareas gratis`}>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: FREE_LIFETIME_TASKS }, (_, i) => (
          <span key={i} className={`h-2 w-5 rounded-full ${i < used ? 'bg-slate-200' : 'bg-[#25D366]'}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-600">
        {left} {left === 1 ? 'tarea gratis' : 'tareas gratis'}
      </span>
    </div>
  )
}

function messageText(message: TutorMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ')
}

export function TutorChat({
  name,
  initialTasksUsed,
  initialExhausted = false,
}: {
  name: string
  initialTasksUsed: number
  initialExhausted?: boolean
}) {
  const [input, setInput] = useState('')
  const [image, setImage] = useState<FileUIPart | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [transport] = useState(
    () =>
      new DefaultChatTransport<TutorMessage>({
        api: '/api/tutor',
        prepareSendMessagesRequest: ({ messages, body }) => {
          const stored = readLocalStudent()
          const student: TutorStudentState = stored ?? { name, tasksUsed: initialTasksUsed }
          return { body: { ...body, messages, student } }
        },
      }),
  )
  const { messages, sendMessage, status, error } = useChat<TutorMessage>({
    transport,
    onFinish: ({ message }) => {
      const meta = message.metadata
      if (!meta) return
      if (meta.limitReached) {
        updateLocalStudent({ exhausted: true })
        return
      }
      const finishedLastFree =
        !meta.subscribed &&
        meta.tasksUsed >= FREE_LIFETIME_TASKS &&
        messageText(message).includes(TASK_COMPLETE_MARKER)
      updateLocalStudent({
        tasksUsed: meta.tasksUsed,
        currentTask: meta.currentTask,
        lastActivityAt: meta.lastActivityAt,
        exhausted: finishedLastFree || undefined,
      })
    },
  })

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant' && m.metadata)
  const lastMeta = lastAssistant?.metadata
  const tasksUsed = lastMeta?.tasksUsed ?? initialTasksUsed
  const limitReached = lastMeta?.limitReached ?? false
  const busy = status === 'submitted' || status === 'streaming'
  const firstName = name.split(' ')[0]

  const lastHasMarker = lastAssistant !== undefined && messageText(lastAssistant).includes(TASK_COMPLETE_MARKER)
  const finishedLastFree = tasksUsed >= FREE_LIFETIME_TASKS && lastHasMarker
  const exhaustedOnLoad = initialExhausted || (messages.length === 0 && initialTasksUsed >= FREE_LIFETIME_TASKS)
  const subscription = useSubscription()
  const subscribed = subscription.active || lastMeta?.subscribed === true
  const plan = subscription.subscription?.plan
  const paidDevice = subscription.paidDevice
  const locked = !subscribed && (exhaustedOnLoad || limitReached || finishedLastFree)
  // A family that already paid never sees the plans again; only a lapsed plan (expired) offers renewal.
  const showPaywall = locked && !paidDevice && (!subscription.activating || subscription.delayed)
  const showFreeTrial = subscription.resolved && !paidDevice && !subscribed
  // The server counts a task when it starts; the meter counts it once it is finished,
  // so it reaches 0 at the exact moment the chat locks.
  const taskInProgress = !locked && Boolean(lastMeta?.currentTask) && !lastHasMarker
  const tasksCompleted = locked ? FREE_LIFETIME_TASKS : Math.max(0, tasksUsed - (taskInProgress ? 1 : 0))

  function submit() {
    const text = input.trim()
    if ((!text && !image) || busy || locked) return
    sendMessage({ text: text || 'Te mando la foto de mi ejercicio.', files: image ? [image] : undefined })
    setInput('')
    setImage(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    event.preventDefault()
    submit()
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    setImageError(null)
    try {
      setImage(await compressImage(file))
    } catch {
      setImageError('No pudimos leer esa imagen. Intenta con otra foto.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="mx-auto flex h-svh w-full max-w-2xl flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-200 px-4 py-3">
        <Link
          href={GUIDE_PATH}
          aria-label="PpGrillo: conoce cómo funciona"
          className="shrink-0 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]"
        >
          <BrandIdentity />
        </Link>
        <div className="order-last w-full sm:order-none sm:w-auto">
          {subscribed || paidDevice ? (
            <PlanBadge plan={plan ?? subscription.paidPlan} />
          ) : showFreeTrial ? (
            <TaskMeter used={tasksCompleted} />
          ) : null}
        </div>
        <div className="flex items-center">
          <Link
            href={GUIDE_PATH}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border-2 border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-[#25D366] hover:text-[#128C7E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            <Info className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline">Conoce cómo funciona PpGrillo</span>
            <span className="md:hidden" aria-hidden="true">Info</span>
            <span className="sr-only md:hidden">Conoce cómo funciona PpGrillo: información y planes</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5" aria-live="polite">
        {subscription.justActivated ? <ActivatedNotice firstName={firstName} plan={plan} /> : null}

        {subscription.needsReverify ? (
          <EmailLogin
            startOpen
            defaultEmail={subscription.paidEmail}
            title={`${firstName}, confirma tu correo para seguir`}
            intro="Este dispositivo ya está ligado a un plan pagado, pero perdimos la sesión segura (por ejemplo, al borrar datos del navegador). Te enviamos un código para confirmarlo; no tienes que pagar de nuevo."
          />
        ) : null}

        {messages.length === 0 && (subscribed || paidDevice) && !subscription.justActivated ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-emerald-50 p-4 text-left">
            <p className="font-display text-lg font-bold text-balance text-slate-900">¡Hola, {firstName}! ¿Qué tarea vemos hoy?</p>
            <p className="text-sm leading-relaxed text-pretty text-slate-700">
              Escribe tu ejercicio o súbele una foto de la libreta y te guío paso a paso.
            </p>
          </div>
        ) : null}

        {messages.length === 0 && !locked && showFreeTrial ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-emerald-50 p-4 text-left">
            <p className="font-display text-lg font-bold text-balance text-slate-900">
              ¡Hola, {firstName}! Tienes {Math.max(0, FREE_LIFETIME_TASKS - tasksCompleted)} tareas de cortesía.
            </p>
            <p className="text-sm leading-relaxed text-pretty text-slate-700">
              Escribe tu ejercicio o súbele una foto de la libreta. Te guío con preguntas paso a paso para que
              llegues tú a la respuesta. Cada ejercicio completo cuenta como 1 tarea, sin importar cuántos mensajes
              uses.
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
              message.role === 'user'
                ? 'self-end rounded-br-md bg-[#25D366] text-white'
                : 'self-start rounded-bl-md bg-slate-100 text-slate-800'
            }`}
          >
            {message.parts.map((part, i) => {
              if (part.type === 'text')
                return (
                  <p key={i} className="whitespace-pre-wrap text-pretty">
                    {message.role === 'assistant' ? stripTaskMarker(part.text) : part.text}
                  </p>
                )
              if (part.type === 'file' && part.mediaType.startsWith('image/'))
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={part.url} alt="Foto del ejercicio" className="max-h-56 rounded-xl object-contain" />
                )
              return null
            })}
          </div>
        ))}

        {status === 'submitted' ? (
          <div className="flex items-center gap-2 self-start rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Pensando…
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="self-start text-sm text-red-600">
            Hubo un problema al responder. Intenta enviar tu mensaje otra vez.
          </p>
        ) : null}

        {subscription.activating || subscription.confirming ? (
          <ActivationCard
            delayed={subscription.delayed || subscription.confirming}
            onCheck={subscription.checkNow}
          />
        ) : null}
        {locked && subscription.paymentFailed ? <PaymentFailedNotice /> : null}
        {showPaywall ? <ChatPaywall firstName={firstName} /> : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-slate-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        {image ? (
          <div className="flex items-center gap-2 self-start rounded-xl bg-slate-100 p-1.5 pr-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="Foto a enviar" className="h-12 w-12 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Quitar foto</span>
            </button>
          </div>
        ) : null}
        {imageError ? <p role="alert" className="text-sm text-red-600">{imageError}</p> : null}
        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            id="tutor-photo"
            disabled={locked}
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <label
            htmlFor="tutor-photo"
            aria-disabled={locked}
            className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-slate-200 text-slate-600 transition-colors hover:border-[#25D366] hover:text-[#128C7E] aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <Camera className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Subir foto del ejercicio</span>
          </label>
          <label htmlFor="tutor-input" className="sr-only">
            Escribe tu ejercicio o respuesta
          </label>
          <textarea
            id="tutor-input"
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={locked}
            placeholder={
              locked
                ? subscription.activating || subscription.confirming
                  ? 'Activando tu cuenta…'
                  : paidDevice
                    ? 'Confirma tu correo para seguir'
                    : 'Elige un plan para seguir con tus tareas'
                : 'Escribe tu ejercicio o tu respuesta…'
            }
            className="max-h-32 min-h-12 flex-1 resize-none rounded-3xl border-2 border-slate-200 bg-white px-4 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#25D366] disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={locked || busy || (!input.trim() && !image)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition-colors hover:bg-[#20bd5a] disabled:opacity-50"
          >
            <SendHorizontal className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Enviar</span>
          </button>
        </div>
      </form>
    </div>
  )
}
