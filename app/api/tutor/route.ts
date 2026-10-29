import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { lightenHistory } from '@/components/app/compress-image'
import { classifyMessage, type MessageKind } from '@/lib/exercise-classifier'
import { FREE_LIFETIME_TASKS, TASK_IDLE_RESET_HOURS } from '@/lib/plans'
import type { TutorMetadata, TutorStudentState } from '@/lib/tutor-types'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const MAX_EXERCISE_CHARS = 600

type TutorBody = {
  messages?: UIMessage[]
  grade?: string
  student?: Partial<TutorStudentState>
}

function buildSystemPrompt(student: string, level: string) {
  return `Eres PpGrillo, un tutor socrático de habla hispana para estudiantes de ${level}. Estás acompañando a ${student}.

TU MÉTODO (obligatorio):
- NUNCA das la respuesta o el resultado final directamente. Jamás resuelves el ejercicio por el alumno.
- Guías con preguntas cortas y claras que llevan al alumno a descubrir la solución por sí mismo, un paso a la vez.
- Haces UNA sola pregunta o das UNA sola pista por mensaje. No abrumas.
- Usas analogías cotidianas y ejemplos concretos apropiados para su edad y grado (${level}).
- Celebras el esfuerzo y los aciertos con calidez ("¡Exacto!", "¡Vas muy bien!"), y cuando se equivoca lo animas sin juzgar y le ayudas a ver dónde repensar.
- Si te comparten una foto de la libreta o del ejercicio, la lees con atención y trabajas sobre ese problema específico.
- Adaptas el lenguaje al grado: más simple y con más apoyo para Primaria, más autónomo para Preparatoria.

ESTILO:
- Cálido, paciente, cercano y motivador. Hablas de "tú".
- Mensajes breves (1 a 3 frases). Terminas casi siempre con una pregunta que invita a pensar.
- Español neutro de México. Sin tecnicismos innecesarios.

Si el alumno insiste en que le des la respuesta, con amabilidad le explicas que tu trabajo es ayudarlo a llegar solo, y le ofreces la siguiente pista.`
}

// Extract the plain text of the latest user message so the demo mode can
// respond with something relevant when no API key is configured.
function latestUserText(messages: UIMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) return ''
  return lastUser.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ')
    .trim()
}

// A simulated Socratic reply used only when GEMINI_API_KEY is not set, so the
// interface can be tested in Preview without a real model.
function demoSocraticReply(student: string, userText: string): string {
  const name = student && student !== 'el alumno' ? student : null
  const greeting = name ? `¡Hola, ${name}! ` : '¡Hola! '
  if (!userText) {
    return `${greeting}Cuéntame, ¿en qué materia o problema estás trabajando hoy? Descríbemelo con tus palabras y lo resolvemos juntos, paso a paso.`
  }
  return `${greeting}Me encanta que me traigas esto: "${userText}". Antes de avanzar, quiero entender cómo lo ves tú. ¿Qué es lo primero que crees que deberíamos averiguar para empezar a resolverlo?

_(Modo demostración: para respuestas completas del tutor, configura la variable GEMINI_API_KEY.)_`
}

async function streamDemo(
  student: string,
  userText: string,
  metadata: TutorMetadata,
): Promise<Response> {
  const text = demoSocraticReply(student, userText)
  const words = text.split(/(\s+)/)
  const id = 'demo-text'

  const stream = createUIMessageStream({
    async execute({ writer }) {
      writer.write({ type: 'start', messageMetadata: metadata })
      writer.write({ type: 'text-start', id })
      for (const word of words) {
        writer.write({ type: 'text-delta', id, delta: word })
        // Small delay to simulate a natural typing/streaming feel.
        await new Promise((resolve) => setTimeout(resolve, 25))
      }
      writer.write({ type: 'text-end', id })
    },
  })

  return createUIMessageStreamResponse({ stream })
}

function latestUserHasImage(messages: UIMessage[]): boolean {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  return Boolean(lastUser?.parts.some((p) => p.type === 'file'))
}

function streamStatic(text: string, metadata: TutorMetadata): Response {
  const id = 'static-text'
  const stream = createUIMessageStream({
    execute({ writer }) {
      writer.write({ type: 'start', messageMetadata: metadata })
      writer.write({ type: 'text-start', id })
      writer.write({ type: 'text-delta', id, delta: text })
      writer.write({ type: 'text-end', id })
    },
  })
  return createUIMessageStreamResponse({ stream })
}

function limitReachedReply(name: string) {
  const first = name.split(' ')[0]
  return `¡Qué gusto haber aprendido contigo, ${first}! Ya usaste tus ${FREE_LIFETIME_TASKS} tareas de cortesía. Para resolver este nuevo ejercicio y seguir aprendiendo, elige un plan aquí abajo.`
}

export async function POST(req: Request) {
  const { messages = [], grade, student: state }: TutorBody = await req.json().catch(() => ({}))

  const name = typeof state?.name === 'string' ? state.name.trim().slice(0, 60) : ''
  let tasksUsed = Number.isFinite(state?.tasksUsed) ? Math.max(0, Math.floor(Number(state?.tasksUsed))) : 0
  const lastActivityAt = typeof state?.lastActivityAt === 'number' ? state.lastActivityAt : undefined
  const storedTask = typeof state?.currentTask === 'string' ? state.currentTask.slice(0, MAX_EXERCISE_CHARS) : undefined

  const now = Date.now()
  const userText = latestUserText(messages)
  const hasImage = latestUserHasImage(messages)
  const idle = lastActivityAt !== undefined && now - lastActivityAt > TASK_IDLE_RESET_HOURS * 3_600_000
  const currentExercise = idle ? undefined : storedTask
  const classifierInput = userText || (hasImage ? '[Foto de un ejercicio de la libreta]' : '')
  let kind: MessageKind = 'new'
  try {
    kind = hasImage && !currentExercise ? 'new' : await classifyMessage(currentExercise, classifierInput)
  } catch {
    kind = currentExercise ? 'continuation' : 'new'
  }

  if (kind === 'new' && tasksUsed >= FREE_LIFETIME_TASKS) {
    return streamStatic(limitReachedReply(name || 'amigo'), { tasksUsed, limitReached: true })
  }

  let currentTask = currentExercise
  if (kind === 'new') {
    tasksUsed += 1
    currentTask = classifierInput.slice(0, MAX_EXERCISE_CHARS)
  }

  const metadata: TutorMetadata = {
    tasksUsed,
    limitReached: false,
    currentTask,
    lastActivityAt: kind === 'other' ? lastActivityAt : now,
  }
  const student = name || 'el alumno'
  const level = grade?.trim() || 'K-12 (pregúntale su grado si no lo sabes)'
  const system = buildSystemPrompt(student, level)

  const apiKey = process.env.GEMINI_API_KEY

  // Demo mode: no API key configured yet. Return a simulated Socratic response
  // so the interface remains fully testable in Preview.
  if (!apiKey) {
    return streamDemo(student, userText, metadata)
  }

  // Real mode: call the official Google Gemini API directly with the API key,
  // without going through the Vercel AI Gateway.
  const google = createGoogleGenerativeAI({ apiKey })

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system,
    messages: await convertToModelMessages(lightenHistory(messages)),
  })

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => (part.type === 'start' ? metadata : undefined),
  })
}
