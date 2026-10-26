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

function cxResponse(parameters: SessionParameters) {
  return Response.json({ sessionInfo: { parameters } }, { status: 200 })
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json().catch(() => ({}))) as CxWebhookRequest
    const phone = extractPhone(body)
    const auth = getGoogleAuth()

    if (phone.length !== 10 || !auth) {
      console.error(`[dialogflow] Profile lookup skipped - phone valid: ${phone.length === 10}, auth: ${!!auth}`)
      return cxResponse({ Registrado: false })
    }

    const session = await getStudentSessionParams(auth, phone)
    console.log(`[dialogflow] Profile lookup for ${phone}: ${session.lookup}`)

    if (session.lookup === 'error') return cxResponse({ Registrado: false })
    return cxResponse({ Registrado: session.registrado, Nombre: session.nombre, Grado: session.grado })
  } catch (error) {
    console.error('[dialogflow] Webhook error:', error)
    return cxResponse({ Registrado: false })
  }
}
