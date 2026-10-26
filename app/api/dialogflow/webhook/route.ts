import { timingSafeEqual } from 'node:crypto'
import { getGoogleAuth } from '@/lib/google-auth'
import { getStudentSessionParams, normalizePhone } from '@/lib/whatsapp-users'

export const dynamic = 'force-dynamic'

type CxWebhookRequest = {
  sessionInfo?: { session?: string; parameters?: Record<string, unknown> }
  payload?: Record<string, unknown>
}

type SessionParameters = { Registrado: boolean; Nombre?: string; Grado?: string }

function expectedToken(): string | undefined {
  return process.env.DIALOGFLOW_WEBHOOK_TOKEN || process.env.WEBHOOK_VERIFY_TOKEN || undefined
}

function isAuthorized(request: Request): boolean {
  const expected = expectedToken()
  if (!expected) return true
  const header = request.headers.get('authorization') ?? ''
  const provided = request.headers.get('x-webhook-token') ?? header.replace(/^Bearer\s+/i, '')
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

// The WhatsApp webhook sends `phone` in queryParams and uses the 10-digit phone as the session ID,
// so either source identifies the student.
function extractPhone(body: CxWebhookRequest): string {
  const params = body.sessionInfo?.parameters ?? {}
  for (const key of ['phone', 'phone_number', 'phone_e164', 'telefono']) {
    const value = params[key]
    if (typeof value === 'string' || typeof value === 'number') {
      const digits = normalizePhone(String(value))
      if (digits.length === 10) return digits
    }
  }
  const sessionId = body.sessionInfo?.session?.split('/').pop() ?? ''
  return normalizePhone(sessionId)
}

// Dialogflow CX aborts webhooks after 5s by default, so the whole lookup (token + Firestore read)
// must finish well before that or the agent reports a webhook error and stops replying.
const LOOKUP_DEADLINE_MS = 3_000

const NOT_REGISTERED: SessionParameters = { Registrado: false }

function cxResponse(parameters: SessionParameters) {
  const clean: SessionParameters = { Registrado: parameters.Registrado === true }
  if (typeof parameters.Nombre === 'string' && parameters.Nombre) clean.Nombre = parameters.Nombre.slice(0, 100)
  if (typeof parameters.Grado === 'string' && parameters.Grado) clean.Grado = parameters.Grado.slice(0, 50)
  return new Response(JSON.stringify({ sessionInfo: { parameters: clean } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

async function lookupSession(body: CxWebhookRequest): Promise<SessionParameters> {
  const phone = extractPhone(body)
  const auth = getGoogleAuth()

  if (phone.length !== 10 || !auth) {
    console.error(`[dialogflow] Profile lookup skipped - phone valid: ${phone.length === 10}, auth: ${!!auth}`)
    return NOT_REGISTERED
  }

  const session = await getStudentSessionParams(auth, phone)
  console.log(`[dialogflow] Profile lookup for ${phone}: ${session.lookup}`)

  if (session.lookup === 'error') return NOT_REGISTERED
  return { Registrado: session.registrado, Nombre: session.nombre, Grado: session.grado }
}

function withDeadline<T>(promise: Promise<T>, fallback: T, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.error(`[dialogflow] Profile lookup exceeded ${ms}ms - responding Registrado: false`)
      resolve(fallback)
    }, ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

export async function POST(request: Request) {
  try {
    // An auth failure still answers 200 with Registrado: false (no profile data is exposed) so a
    // misconfigured token never makes Dialogflow treat the webhook as broken.
    if (!isAuthorized(request)) {
      console.error('[dialogflow] Unauthorized webhook call - responding Registrado: false')
      return cxResponse(NOT_REGISTERED)
    }

    const body = (await request.json().catch(() => ({}))) as CxWebhookRequest
    const parameters = await withDeadline(
      lookupSession(body).catch((error) => {
        console.error('[dialogflow] Profile lookup error:', error)
        return NOT_REGISTERED
      }),
      NOT_REGISTERED,
      LOOKUP_DEADLINE_MS,
    )
    return cxResponse(parameters)
  } catch (error) {
    console.error('[dialogflow] Webhook error:', error)
    return cxResponse(NOT_REGISTERED)
  }
}

export function GET() {
  return cxResponse(NOT_REGISTERED)
}
