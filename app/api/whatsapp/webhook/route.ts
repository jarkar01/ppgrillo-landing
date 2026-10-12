import { after } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
import { normalizePhone, upsertWhatsAppUser, type UserProfile } from '@/lib/whatsapp-users'

export const runtime = 'nodejs'
export const maxDuration = 30

// waba-v2 proxies Cloud API at /messages; the legacy /v1/messages path returns a generic 400.
const D360_MESSAGES_URL = 'https://waba-v2.360dialog.io/messages'

const DIALOGFLOW_AGENT_URL =
  'https://us-central1-dialogflow.googleapis.com/v3/projects/ppgrillo-06/locations/us-central1/agents/600bbe0a-3f7b-405c-9ea3-b89eee47d816'

const FALLBACK_REPLY =
  'Uy, tuve un pequeño problema para pensar mi respuesta. ¿Me puedes volver a escribir tu duda, por favor?'

type IncomingTextMessage = {
  from: string
  text: string
  id?: string
}

type WhatsAppMessage = {
  from?: string
  id?: string
  type?: string
  timestamp?: string
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

type DetectIntentResponse = {
  queryResult?: {
    responseMessages?: Array<{ text?: { text?: string[] } }>
  }
}

let googleAuth: GoogleAuth | null = null

function getGoogleAuth(): GoogleAuth | null {
  if (googleAuth) return googleAuth
  const rawKey = process.env.GCP_SERVICE_ACCOUNT_KEY
  if (!rawKey) {
    console.error('[whatsapp] GCP_SERVICE_ACCOUNT_KEY is not configured')
    return null
  }
  try {
    googleAuth = new GoogleAuth({
      credentials: JSON.parse(rawKey),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    return googleAuth
  } catch (error) {
    console.error('[whatsapp] GCP_SERVICE_ACCOUNT_KEY is not valid JSON:', error)
    return null
  }
}

function collectMessages(payload: WebhookPayload): WhatsAppMessage[] {
  return [
    ...(payload.messages ?? []),
    ...(payload.entry ?? []).flatMap((entry) =>
      (entry.changes ?? []).flatMap((change) => change.value?.messages ?? []),
    ),
  ]
}

function extractTextMessages(raw: WhatsAppMessage[]): IncomingTextMessage[] {
  return raw
    .filter((m) => m.type === 'text' && m.from && m.text?.body?.trim())
    .map((m) => ({ from: m.from!, text: m.text!.body!.trim(), id: m.id }))
}

// Any message type (text, image, audio...) counts as first contact; keep the earliest per sender.
function extractSenders(raw: WhatsAppMessage[]): Map<string, Date> {
  const senders = new Map<string, Date>()
  for (const m of raw) {
    if (!m.from) continue
    const seconds = Number(m.timestamp)
    const sentAt = Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : new Date()
    const previous = senders.get(m.from)
    if (!previous || sentAt < previous) senders.set(m.from, sentAt)
  }
  return senders
}

async function registerSenders(senders: Map<string, Date>): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>()
  const auth = getGoogleAuth()
  if (!auth) return profiles
  await Promise.allSettled(
    [...senders].map(async ([phone, sentAt]) => {
      try {
        const profile = await upsertWhatsAppUser(auth, phone, sentAt)
        if (profile) profiles.set(phone, profile)
      } catch (error) {
        console.error('[whatsapp] Firestore user registration error:', error)
      }
    }),
  )
  return profiles
}

function buildTutorContext(profile: UserProfile) {
  const instructions = [
    `El estudiante vive en ${profile.country}.`,
    `Sistema educativo: ${profile.educationSystem}.`,
    profile.grade ? `Grado escolar: ${profile.grade}.` : null,
    profile.name ? `Nombre del estudiante: ${profile.name}.` : null,
    `Adapta explicaciones, terminología, unidades, moneda, ejemplos y temario al plan de estudios oficial de ${profile.country}, manteniendo el método socrático de PpGrillo.`,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    endUserMetadata: {
      country: profile.country,
      education_system: profile.educationSystem,
      ...(profile.grade ? { grade: profile.grade } : {}),
      ...(profile.name ? { student_name: profile.name } : {}),
      tutor_instructions: instructions,
    },
    parameters: {
      student_country: profile.country,
      education_system: profile.educationSystem,
      student_grade: profile.grade ?? '',
      student_name: profile.name ?? '',
      student_context: instructions,
    },
  }
}

async function detectIntent(
  profile: UserProfile | undefined,
  fromNumber: string,
  textBody: string,
): Promise<string> {
  const auth = getGoogleAuth()
  if (!auth) return FALLBACK_REPLY

  // One session per normalized phone keeps each student's memory stable across number formats.
  const sessionId = profile?.phone ?? normalizePhone(fromNumber)

  try {
    const token = await auth.getAccessToken()
    const res = await fetch(`${DIALOGFLOW_AGENT_URL}/sessions/${sessionId}:detectIntent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        queryInput: {
          text: { text: textBody },
          languageCode: 'es',
        },
        ...(profile ? { queryParams: buildTutorContext(profile) } : {}),
      }),
    })

    if (!res.ok) {
      const responseBody = await res.text()
      console.error(
        `[whatsapp] Dialogflow detectIntent failed - status: ${res.status} - body: ${responseBody}`,
      )
      return FALLBACK_REPLY
    }

    const data = (await res.json()) as DetectIntentResponse
    const reply = (data.queryResult?.responseMessages ?? [])
      .filter((message) => message.text?.text?.length)
      .flatMap((message) => message.text!.text!)
      .join('\n\n')
      .trim()

    return reply || FALLBACK_REPLY
  } catch (error) {
    console.error('[whatsapp] Dialogflow request error:', error)
    return FALLBACK_REPLY
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

async function handleMessage(message: IncomingTextMessage, profile: UserProfile | undefined) {
  const reply = await detectIntent(profile, message.from, message.text)
  await sendWhatsAppText(message.from, reply)
}

export async function POST(req: Request) {
  let payload: WebhookPayload
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const raw = collectMessages(payload)
  const messages = extractTextMessages(raw)
  const senders = extractSenders(raw)

  // 360dialog expects a fast 200; register users and send replies after responding.
  if (senders.size > 0) {
    after(async () => {
      const profiles = await registerSenders(senders)
      await Promise.allSettled(messages.map((m) => handleMessage(m, profiles.get(m.from))))
    })
  }

  return Response.json({ received: true, processed: messages.length })
}

export async function GET() {
  return Response.json({ status: 'ok', service: 'PpGrillo WhatsApp webhook' })
}
