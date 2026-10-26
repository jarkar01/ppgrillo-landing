import { createHmac, timingSafeEqual } from 'node:crypto'
import { after } from 'next/server'
import { getGoogleAuth } from '@/lib/google-auth'
import { sendWhatsAppText } from '@/lib/whatsapp-cloud'
import { classifyMessage } from '@/lib/exercise-classifier'
import { extractStudentData } from '@/lib/profile-extractor'
import {
  activeExercise,
  consumeTask,
  normalizePhone,
  phoneE164,
  saveStudentProfile,
  upsertWhatsAppUser,
  type UserProfile,
} from '@/lib/whatsapp-users'
import {
  LAST_FREE_TASK_NOTICE,
  WELCOME_MESSAGE,
  enforceTrialCopy,
  freeExhaustedPaywall,
  plansMessage,
  profileSavedMessage,
  standardLimitPaywall,
} from '@/lib/plans'

export const runtime = 'nodejs'
export const maxDuration = 30

const DIALOGFLOW_AGENT_URL =
  'https://us-central1-dialogflow.googleapis.com/v3/projects/ppgrillo-06/locations/us-central1/agents/600bbe0a-3f7b-405c-9ea3-b89eee47d816'

const FALLBACK_REPLY =
  'Uy, tuve un pequeño problema para pensar mi respuesta. ¿Me puedes volver a escribir tu duda, por favor?'

type IncomingTextMessage = {
  from: string
  text: string
  id?: string
  phoneNumberId?: string
}

type WhatsAppMessage = {
  from?: string
  id?: string
  type?: string
  timestamp?: string
  text?: { body?: string }
}

type WebhookPayload = {
  object?: string
  entry?: Array<{
    changes?: Array<{
      field?: string
      value?: {
        metadata?: { phone_number_id?: string; display_phone_number?: string }
        messages?: WhatsAppMessage[]
      }
    }>
  }>
}

type ReceivedMessage = WhatsAppMessage & { phoneNumberId?: string }

type DetectIntentResponse = {
  queryResult?: {
    responseMessages?: Array<{ text?: { text?: string[] } }>
  }
}

function getVerifyToken(): string {
  return (
    process.env.WHATSAPP_VERIFY_TOKEN ||
    process.env.VERIFY_TOKEN ||
    process.env.WEBHOOK_VERIFY_TOKEN ||
    'ppgrillo_token_secreto_2026'
  )
}

// Meta signs every POST with HMAC-SHA256 of the raw body using the App Secret.
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (!appSecret) {
    console.warn('[whatsapp] WHATSAPP_APP_SECRET is not set; skipping signature validation')
    return true
  }
  if (!signatureHeader?.startsWith('sha256=')) return false

  const expected = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex')
  const received = signatureHeader.slice('sha256='.length)
  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(received, 'hex')
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  )
}

function collectMessages(payload: WebhookPayload): ReceivedMessage[] {
  return (payload.entry ?? []).flatMap((entry) =>
    (entry.changes ?? []).flatMap((change) => {
      const phoneNumberId = change.value?.metadata?.phone_number_id
      return (change.value?.messages ?? []).map((m) => ({ ...m, phoneNumberId }))
    }),
  )
}

function extractTextMessages(raw: ReceivedMessage[]): IncomingTextMessage[] {
  return raw
    .filter((m) => m.type === 'text' && m.from && m.text?.body?.trim())
    .map((m) => ({
      from: m.from!,
      text: m.text!.body!.trim(),
      id: m.id,
      phoneNumberId: m.phoneNumberId,
    }))
}

type Sender = { rawPhone: string; sentAt: Date }

// Any message type (text, image, audio...) counts as first contact; keep the earliest per sender.
// Keyed by the 10-digit normalized phone so different formats of one number collapse into one user.
function extractSenders(raw: ReceivedMessage[]): Map<string, Sender> {
  const senders = new Map<string, Sender>()
  for (const m of raw) {
    if (!m.from) continue
    const phone = normalizePhone(m.from)
    if (!phone) continue
    const seconds = Number(m.timestamp)
    const sentAt = Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : new Date()
    const previous = senders.get(phone)
    if (!previous || sentAt < previous.sentAt) senders.set(phone, { rawPhone: m.from, sentAt })
  }
  return senders
}

async function registerSenders(senders: Map<string, Sender>): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>()
  const auth = getGoogleAuth()
  if (!auth) return profiles
  await Promise.allSettled(
    [...senders].map(async ([phone, { rawPhone, sentAt }]) => {
      try {
        const profile = await upsertWhatsAppUser(auth, rawPhone, sentAt)
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
  const tutorContext = profile ? buildTutorContext(profile) : undefined

  // The Dialogflow profile tool looks up Firestore by these, so they are sent on every turn.
  const queryParams = {
    ...(tutorContext?.endUserMetadata ? { endUserMetadata: tutorContext.endUserMetadata } : {}),
    parameters: {
      ...(tutorContext?.parameters ?? {}),
      phone: sessionId,
      phone_number: sessionId,
      phone_e164: phoneE164(fromNumber),
    },
  }

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
        queryParams,
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

    if (reply && reply !== enforceTrialCopy(reply)) {
      console.warn('[whatsapp] Dialogflow reply mentioned a day-based trial; replaced with 3-task copy')
    }
    return reply ? enforceTrialCopy(reply) : FALLBACK_REPLY
  } catch (error) {
    console.error('[whatsapp] Dialogflow request error:', error)
    return FALLBACK_REPLY
  }
}

const PLANS_KEYWORDS = new Set(['planes', 'plan', 'precios', 'pagar', 'suscribirme'])

function isPlansRequest(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim()
  return PLANS_KEYWORDS.has(normalized)
}

// Messages from one sender in a batch are handled in order so replies keep the chat's sequence.
async function handleSender(
  phone: string,
  sender: Sender,
  messages: IncomingTextMessage[],
  profile: UserProfile | undefined,
) {
  const phoneNumberId = messages[0]?.phoneNumberId

  if (profile?.isNew) {
    await sendWhatsAppText(sender.rawPhone, WELCOME_MESSAGE, phoneNumberId)
  }

  const auth = getGoogleAuth()
  let startedLastFreeTask = false

  for (const message of messages) {
    if (isPlansRequest(message.text)) {
      await sendWhatsAppText(message.from, plansMessage(), message.phoneNumberId)
      continue
    }

    // Fail open when Firestore is unavailable so a storage outage never silences the tutor.
    if (profile && auth) {
      const now = new Date()
      const needsProfile = !profile.name || !profile.grade
      const [kind, extracted] = await Promise.all([
        classifyMessage(activeExercise(profile.usage, now), message.text),
        needsProfile ? extractStudentData(message.text) : Promise.resolve({}),
      ])

      const saved = needsProfile ? await saveStudentProfile(auth, profile, extracted) : {}
      // A reply like "Soy Ana, voy en 5º" is registration, not an exercise: confirm and wait.
      if ((saved.name || saved.grade) && kind !== 'new') {
        await sendWhatsAppText(message.from, profileSavedMessage(profile), message.phoneNumberId)
        continue
      }
      // A brand-new user's greeting is already answered by WELCOME_MESSAGE; a second
      // reply from Dialogflow's welcome intent would contradict it.
      if (profile.isNew && kind !== 'new') continue

      const access = await consumeTask(auth, profile, now, kind, message.text)

      if (!access.allowed) {
        const paywall =
          access.reason === 'standard_limit' ? standardLimitPaywall() : freeExhaustedPaywall()
        await sendWhatsAppText(message.from, paywall, message.phoneNumberId)
        console.log(`[whatsapp] Paywall (${access.reason}) sent to ${phone} - message kind: ${kind}`)
        return
      }
      if (access.startedTask) {
        console.log(`[whatsapp] New exercise for ${phone} (free used: ${profile.usage.freeTasksUsed})`)
      }
      if (access.isLastFreeTask) startedLastFreeTask = true
    }

    const reply = await detectIntent(profile, message.from, message.text)
    await sendWhatsAppText(message.from, reply, message.phoneNumberId)
  }

  if (startedLastFreeTask) {
    await sendWhatsAppText(sender.rawPhone, LAST_FREE_TASK_NOTICE, phoneNumberId)
  }
}

// Meta webhook verification handshake.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === getVerifyToken() && challenge) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  return new Response('Forbidden', { status: 403 })
}

export async function POST(req: Request) {
  const rawBody = await req.text()

  if (!isValidSignature(rawBody, req.headers.get('x-hub-signature-256'))) {
    console.error('[whatsapp] Invalid X-Hub-Signature-256')
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.object !== 'whatsapp_business_account') {
    return Response.json({ received: true, processed: 0 })
  }

  const raw = collectMessages(payload)
  const messages = extractTextMessages(raw)
  const senders = extractSenders(raw)

  // Meta retries if it doesn't get a fast 200; register users and send replies after responding.
  if (senders.size > 0) {
    after(async () => {
      const profiles = await registerSenders(senders)
      await Promise.allSettled(
        [...senders].map(([phone, sender]) =>
          handleSender(
            phone,
            sender,
            messages.filter((m) => normalizePhone(m.from) === phone),
            profiles.get(phone),
          ),
        ),
      )
    })
  }

  return Response.json({ received: true, processed: messages.length })
}
