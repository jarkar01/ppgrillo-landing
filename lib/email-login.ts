import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { sendGmail } from '@/lib/gmail'
import { getSubscriptionByEmail } from '@/lib/subscription'
import { emailUserDocId, firestoreContext, patchDocument, type FirestoreFields } from '@/lib/web-users'

const LOGIN_CODES = 'login_codes'
const CODE_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 45 * 1000
const MAX_ATTEMPTS = 5
const REQUEST_TIMEOUT_MS = 5_000

export type RequestCodeResult =
  | { ok: true }
  | { ok: false; reason: 'not_active' | 'expired_plan' | 'cooldown' | 'send_failed' | 'unavailable' }

export type VerifyCodeResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'expired' | 'too_many_attempts' | 'unavailable' }

function hashCode(email: string, code: string): Buffer {
  return createHash('sha256').update(`${email}:${code}`).digest()
}

type StoredCode = { hash: string; expiresAt: number; createdAt: number; attempts: number }

async function readStoredCode(docPath: string): Promise<StoredCode | null | 'error'> {
  const ctx = await firestoreContext()
  if (!ctx) return 'error'
  try {
    const res = await fetch(`${ctx.base}/${docPath}`, {
      headers: ctx.headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (res.status === 404) return null
    if (!res.ok) {
      console.error('[email-login] Read failed:', res.status, await res.text())
      return 'error'
    }
    const fields = ((await res.json()) as { fields?: FirestoreFields }).fields ?? {}
    const get = (key: string) => fields[key]
    const hash = get('code_hash')
    const expires = get('expires_at')
    const created = get('created_at')
    const attempts = get('attempts')
    if (!hash || !('stringValue' in hash) || !expires || !('timestampValue' in expires)) return null
    return {
      hash: hash.stringValue,
      expiresAt: new Date(expires.timestampValue).getTime(),
      createdAt: created && 'timestampValue' in created ? new Date(created.timestampValue).getTime() : 0,
      attempts: attempts && 'integerValue' in attempts ? Number(attempts.integerValue) || 0 : 0,
    }
  } catch (error) {
    console.error('[email-login] Read error:', error)
    return 'error'
  }
}

async function deleteStoredCode(docPath: string) {
  const ctx = await firestoreContext()
  if (!ctx) return
  await fetch(`${ctx.base}/${docPath}`, {
    method: 'DELETE',
    headers: ctx.headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  }).catch((error: unknown) => console.error('[email-login] Delete error:', error))
}

function codeEmail(code: string) {
  return {
    subject: `Tu código para entrar a PpGrillo: ${code}`,
    text: `Tu código para entrar a PpGrillo es ${code}. Vence en 10 minutos. Si no lo pediste, ignora este correo.`,
    html: `<div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
<p>Tu código para entrar a PpGrillo es:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:12px 0">${code}</p>
<p>Vence en 10 minutos. Si no lo pediste, puedes ignorar este correo.</p>
</div>`,
  }
}

/** Sends a one-time code only to emails that have an active plan in Firestore. */
export async function requestLoginCode(email: string): Promise<RequestCodeResult> {
  const subscription = await getSubscriptionByEmail(email)
  if (subscription === 'error') return { ok: false, reason: 'unavailable' }
  if (subscription.status === 'expired') return { ok: false, reason: 'expired_plan' }
  if (subscription.status !== 'active') return { ok: false, reason: 'not_active' }

  const docPath = `${LOGIN_CODES}/${emailUserDocId(email)}`
  const existing = await readStoredCode(docPath)
  if (existing === 'error') return { ok: false, reason: 'unavailable' }
  if (existing && Date.now() - existing.createdAt < RESEND_COOLDOWN_MS) return { ok: false, reason: 'cooldown' }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const now = Date.now()
  const saved = await patchDocument(docPath, {
    code_hash: { stringValue: hashCode(email, code).toString('hex') },
    created_at: { timestampValue: new Date(now).toISOString() },
    expires_at: { timestampValue: new Date(now + CODE_TTL_MS).toISOString() },
    attempts: { integerValue: '0' },
  })
  if (!saved) return { ok: false, reason: 'unavailable' }

  const sent = await sendGmail(email, codeEmail(code))
  if (!sent.ok) {
    console.error('[email-login] Code email failed:', sent.reason)
    await deleteStoredCode(docPath)
    return { ok: false, reason: 'send_failed' }
  }
  return { ok: true }
}

export async function verifyLoginCode(email: string, code: string): Promise<VerifyCodeResult> {
  const docPath = `${LOGIN_CODES}/${emailUserDocId(email)}`
  const stored = await readStoredCode(docPath)
  if (stored === 'error') return { ok: false, reason: 'unavailable' }
  if (!stored) return { ok: false, reason: 'expired' }
  if (stored.expiresAt <= Date.now()) {
    await deleteStoredCode(docPath)
    return { ok: false, reason: 'expired' }
  }
  if (stored.attempts >= MAX_ATTEMPTS) {
    await deleteStoredCode(docPath)
    return { ok: false, reason: 'too_many_attempts' }
  }

  const expected = Buffer.from(stored.hash, 'hex')
  const actual = hashCode(email, code)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    await patchDocument(docPath, { attempts: { integerValue: String(stored.attempts + 1) } })
    return { ok: false, reason: 'invalid' }
  }

  await deleteStoredCode(docPath)
  return { ok: true }
}
