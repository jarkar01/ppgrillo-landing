import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export type StudentData = { name?: string; grade?: string }

const EXTRACTOR_TIMEOUT_MS = 6_000
const MAX_MESSAGE_CHARS = 400
const MAX_NAME_CHARS = 40
const MAX_GRADE_CHARS = 40

const SYSTEM_PROMPT = `Eres el asistente de registro de PpGrillo, un tutor escolar en WhatsApp.
Del MENSAJE del estudiante extrae SOLO su propio nombre y su grado escolar, si los dice.
- "name": el nombre de pila del estudiante (ej. "Ana", "Luis Ángel"). NO uses nombres que aparezcan dentro de un ejercicio o problema (ej. "Juan tiene 5 manzanas" no es su nombre).
- "grade": su grado escolar normalizado en español, ej. "5º de primaria", "2º de secundaria", "1º de preparatoria", "3º de kínder", "universidad".
Si un dato no aparece, usa null. Responde SOLO con JSON: {"name": string|null, "grade": string|null}`

const LEVELS: Array<[RegExp, string]> = [
  [/primaria/i, 'primaria'],
  [/secundaria/i, 'secundaria'],
  [/prepa|bachiller/i, 'preparatoria'],
  [/k[ií]nder|preescolar/i, 'kínder'],
]

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function clean(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.replace(/[*_~`"]/g, '').replace(/\s+/g, ' ').trim()
  if (!text || text.toLowerCase() === 'null') return undefined
  return text.slice(0, max)
}

/** Used when Gemini is unavailable: catches "me llamo Ana, voy en 5o de primaria". */
export function fallbackExtract(message: string): StudentData {
  const nameMatch = message.match(
    /(?:me llamo|mi nombre es|soy)\s+([a-záéíóúñü]+(?:\s+[a-záéíóúñü]+)?)/i,
  )
  const firstWords = nameMatch?.[1]
    .split(/\s+/)
    .filter((w) => !/^(de|del|en|y|voy|estoy|el|la|un|una)$/i.test(w))
  const name = firstWords?.length ? titleCase(firstWords.slice(0, 2).join(' ')) : undefined

  let grade: string | undefined
  const gradeMatch = message.match(/(\d{1,2})\s*(?:º|°|o|ro|do|to|vo|no|er|avo)?\.?\s*(?:grado|año|ano)?\s*(?:de\s+)?/i)
  const level = LEVELS.find(([re]) => re.test(message))?.[1]
  if (gradeMatch && level) grade = `${gradeMatch[1]}º de ${level}`
  else if (/universidad/i.test(message)) grade = 'universidad'

  return { name: clean(name, MAX_NAME_CHARS), grade }
}

export async function extractStudentData(message: string): Promise<StudentData> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return fallbackExtract(message)

  const google = createGoogleGenerativeAI({ apiKey })
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      prompt: `MENSAJE: ${message.slice(0, MAX_MESSAGE_CHARS)}`,
      temperature: 0,
      abortSignal: AbortSignal.timeout(EXTRACTOR_TIMEOUT_MS),
    })
    const json = text.match(/\{[\s\S]*\}/)?.[0]
    if (json) {
      const parsed = JSON.parse(json) as { name?: unknown; grade?: unknown }
      return { name: clean(parsed.name, MAX_NAME_CHARS), grade: clean(parsed.grade, MAX_GRADE_CHARS) }
    }
    console.warn(`[whatsapp] Unexpected profile extractor output "${text.slice(0, 120)}"`)
  } catch (error) {
    console.error('[whatsapp] Profile extractor error:', error)
  }
  return fallbackExtract(message)
}
