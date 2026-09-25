import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

type TutorBody = {
  messages: UIMessage[]
  studentName?: string
  grade?: string
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

async function streamDemo(student: string, userText: string): Promise<Response> {
  const text = demoSocraticReply(student, userText)
  const words = text.split(/(\s+)/)
  const id = 'demo-text'

  const stream = createUIMessageStream({
    async execute({ writer }) {
      writer.write({ type: 'start' })
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

export async function POST(req: Request) {
  const { messages, studentName, grade }: TutorBody = await req.json()

  const student = studentName?.trim() || 'el alumno'
  const level = grade?.trim() || 'K-12'
  const system = buildSystemPrompt(student, level)

  const apiKey = process.env.GEMINI_API_KEY

  // Demo mode: no API key configured yet. Return a simulated Socratic response
  // so the interface remains fully testable in Preview.
  if (!apiKey) {
    return streamDemo(student, latestUserText(messages))
  }

  // Real mode: call the official Google Gemini API directly with the API key,
  // without going through the Vercel AI Gateway.
  const google = createGoogleGenerativeAI({ apiKey })

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
