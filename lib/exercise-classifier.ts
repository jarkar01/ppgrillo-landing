import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

/**
 * new   → the student sends a different exercise/problem (consumes one task).
 * same  → a step, answer, question or doubt about the exercise already in progress.
 * other → greetings, thanks, small talk with no exercise (never consumes a task).
 */
export type MessageKind = 'new' | 'same' | 'other'

const CLASSIFIER_TIMEOUT_MS = 6_000
const MAX_CONTEXT_CHARS = 600

const SYSTEM_PROMPT = `Eres el clasificador de tareas de PpGrillo, un tutor escolar socrático en WhatsApp.
Una "tarea" es UN ejercicio o problema completo. Todo el diálogo socrático para resolver ese mismo ejercicio (pasos, respuestas parciales, dudas, "no entiendo", "¿así?", resultados) pertenece a la misma tarea, aunque sean muchos mensajes.

Clasifica el MENSAJE NUEVO del estudiante con UNA sola palabra:
- NUEVO: plantea un ejercicio, problema o pregunta académica distinta al ejercicio en curso (otro número de ejercicio, otra operación, otro tema, otra materia), o no hay ejercicio en curso y el mensaje trae un ejercicio.
- MISMO: continúa, responde o pregunta sobre el ejercicio en curso.
- OTRO: saludo, agradecimiento, despedida o charla sin ningún ejercicio.

Responde solo NUEVO, MISMO u OTRO.`

function fallbackKind(currentExercise: string | undefined, message: string): MessageKind {
  if (currentExercise) return 'same'
  const looksAcademic = /\d|[=+\-*/^√%]|\?/.test(message) || message.trim().length > 25
  return looksAcademic ? 'new' : 'other'
}

export async function classifyMessage(
  currentExercise: string | undefined,
  message: string,
): Promise<MessageKind> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return fallbackKind(currentExercise, message)

  const google = createGoogleGenerativeAI({ apiKey })
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      prompt: [
        `EJERCICIO EN CURSO: ${currentExercise ? currentExercise.slice(0, MAX_CONTEXT_CHARS) : '(ninguno)'}`,
        `MENSAJE NUEVO: ${message.slice(0, MAX_CONTEXT_CHARS)}`,
      ].join('\n'),
      temperature: 0,
      abortSignal: AbortSignal.timeout(CLASSIFIER_TIMEOUT_MS),
    })

    const label = text.trim().toUpperCase()
    if (label.startsWith('NUEVO')) return 'new'
    if (label.startsWith('MISMO')) return currentExercise ? 'same' : 'new'
    if (label.startsWith('OTRO')) return 'other'
    console.warn(`[whatsapp] Unexpected classifier label "${label}"; using fallback`)
  } catch (error) {
    console.error('[whatsapp] Exercise classifier error:', error)
  }
  return fallbackKind(currentExercise, message)
}
