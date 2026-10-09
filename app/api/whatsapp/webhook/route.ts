import { after } from 'next/server'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export const maxDuration = 30

const D360_MESSAGES_URL = 'https://waba-v2.360dialog.io/v1/messages'

const GREETING_PATTERN =
  /^\s*(hola|holi|hey|buen[oa]s(\s+(d[ií]as|tardes|noches))?|qu[eé]\s+tal|saludos|hi|hello|inicio|empezar|comenzar)\b[\s!¡.,¿?]*$/i

type IncomingTextMessage = {
  from: string
  text: string
  id?: string
}

type WhatsAppMessage = {
  from?: string
  id?: string
  type?: string
  text?: { body?: string }
}

type WebhookPayload = {
  messages?: WhatsAppMessage[]
  entry?: Array<{
    changes?: Array<{
      value?: { messages?: WhatsAppMessage[] }
    }>
  }>
}

const SOCRATIC_SYSTEM_PROMPT = `Eres PpGrillo, un tutor socrático de habla hispana para estudiantes de Primaria, Secundaria y Preparatoria. Estás conversando con un alumno por WhatsApp.

TU MÉTODO (obligatorio):
- NUNCA das la respuesta o el resultado final directamente. Jamás resuelves el ejercicio por el alumno.
- Guías con preguntas cortas y claras que llevan al alumno a descubrir la solución por sí mismo, un paso a la vez.
- Haces UNA sola pregunta o das UNA sola pista por mensaje. No abrumas.
- Usas analogías cotidianas y ejemplos concretos apropiados para su edad y grado.
- Celebras el esfuerzo y los aciertos con calidez ("¡Exacto!", "¡Vas muy bien!"), y cuando se equivoca lo animas sin juzgar y le ayudas a ver dónde repensar.
- Adaptas el lenguaje al grado: más simple y con más apoyo para Primaria, más autónomo para Preparatoria. Si no conoces su grado, pregúntalo con amabilidad.

ESTILO (WhatsApp):
- Cálido, paciente, cercano y motivador. Hablas de "tú".
- Mensajes breves (1 a 3 frases). Terminas casi siempre con una pregunta que invita a pensar.
- Español neutro de México. Sin tecnicismos innecesarios.
- No uses Markdown con encabezados ni tablas; para resaltar usa *negritas* al estilo WhatsApp.

Si el alumno insiste en que le des la respuesta, con amabilidad le explicas que tu trabajo es ayudarlo a llegar solo, y le ofreces la siguiente pista.`

const WELCOME_INSTRUCTION = `El alumno acaba de saludarte o es su primer mensaje. Preséntate como PpGrillo, su tutor, con una bienvenida breve y entusiasta, explica en una frase que le ayudarás a aprender haciéndole preguntas (sin darle las respuestas), y pregúntale su *nombre* y su *grado escolar*.`

const FALLBACK_WELCOME =
  '¡Hola! Soy *PpGrillo*, tu tutor. Te voy a ayudar a aprender haciéndote preguntas paso a paso para que descubras las respuestas tú mismo. Para empezar, ¿cómo te llamas y en qué grado escolar vas?'

const FALLBACK_REPLY =
  'Uy, tuve un pequeño problema para pensar mi respuesta. ¿Me puedes volver a escribir tu duda, por favor?'

function extractTextMessages(payload: WebhookPayload): IncomingTextMessage[] {
  const raw: WhatsAppMessage[] = [
    ...(payload.messages ?? []),
    ...(payload.entry ?? []).flatMap((entry) =>
      (entry.changes ?? []).flatMap((change) => change.value?.messages ?? []),
    ),
  ]

  return raw
    .filter((m) => m.type === 'text' && m.from && m.text?.body?.trim())
    .map((m) => ({ from: m.from!, text: m.text!.body!.trim(), id: m.id }))
}

function isGreeting(text: string) {
  return GREETING_PATTERN.test(text)
}

async function generateSocraticReply(text: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  const greeting = isGreeting(text)

  if (!apiKey) {
    console.error('[whatsapp] GEMINI_API_KEY is not configured')
    return greeting ? FALLBACK_WELCOME : FALLBACK_REPLY
  }

  const google = createGoogleGenerativeAI({ apiKey })

  try {
    const { text: reply } = await generateText({
      model: google('gemini-2.5-flash'),
      system: greeting
        ? `${SOCRATIC_SYSTEM_PROMPT}\n\n${WELCOME_INSTRUCTION}`
        : SOCRATIC_SYSTEM_PROMPT,
      prompt: text,
    })
    return reply.trim() || (greeting ? FALLBACK_WELCOME : FALLBACK_REPLY)
  } catch (error) {
    console.error('[whatsapp] Gemini generation failed:', error)
    return greeting ? FALLBACK_WELCOME : FALLBACK_REPLY
  }
}

async function sendWhatsAppText(fromNumber: string, replyText: string) {
  const apiKey = process.env.D360_API_KEY
  if (!apiKey) {
    console.error('[whatsapp] D360_API_KEY is not configured')
    return
  }

  try {
    const res = await fetch(D360_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': apiKey,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: fromNumber,
        type: 'text',
        text: { body: replyText.slice(0, 4096) },
      }),
    })

    if (!res.ok) {
      const responseBody = await res.text()
      console.error(
        `[whatsapp] 360dialog send failed - status: ${res.status} ${res.statusText} - body: ${responseBody}`,
      )
    }
  } catch (error) {
    console.error('[whatsapp] 360dialog request error:', error)
  }
}

async function handleMessage(message: IncomingTextMessage) {
  const reply = await generateSocraticReply(message.text)
  await sendWhatsAppText(message.from, reply)
}

export async function POST(req: Request) {
  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const messages = extractTextMessages(payload)

  // 360dialog expects a fast 200; process replies after responding.
  if (messages.length > 0) {
    after(async () => {
      await Promise.allSettled(messages.map(handleMessage))
    })
  }

  return Response.json({ received: true, processed: messages.length })
}

export async function GET() {
  return Response.json({ status: 'ok', service: 'PpGrillo WhatsApp webhook' })
}
