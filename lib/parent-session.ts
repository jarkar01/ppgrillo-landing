import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * The verified parent email is the single anchor for paid access. It lives in a signed, httpOnly
 * cookie so the server can trust it without the client being able to forge another family's email.
 */
export const PARENT_COOKIE = 'ppg_parent'
const PARENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 5
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let cachedSecret: Buffer | null | undefined

/** Derived from the server-only service account key, so no extra secret has to be configured. */
function signingSecret(): Buffer | null {
  if (cachedSecret !== undefined) return cachedSecret
  try {
    const privateKey = (JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY ?? '') as { private_key?: string }).private_key
    cachedSecret = privateKey ? createHash('sha256').update(`ppg-parent-session:${privateKey}`).digest() : null
  } catch {
    cachedSecret = null
  }
  if (!cachedSecret) console.error('[parent-session] Signing secret unavailable (GCP_SERVICE_ACCOUNT_KEY)')
  return cachedSecret
}

function sign(payload: string, secret: Buffer): Buffer {
  return createHmac('sha256', secret).update(payload).digest()
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function decode(value: string | undefined): string | undefined {
  const secret = signingSecret()
  if (!value || !secret) return undefined
  const [payload, signature] = value.split('.')
  if (!payload || !signature) return undefined
  const expected = sign(payload, secret)
  const actual = Buffer.from(signature, 'base64url')
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return undefined
  const email = normalizeEmail(Buffer.from(payload, 'base64url').toString('utf8'))
  return EMAIL_PATTERN.test(email) ? email : undefined
}

export async function readParentSession(): Promise<string | undefined> {
  return decode((await cookies()).get(PARENT_COOKIE)?.value)
}

/** Persists the verified parent email on this device. Returns false when it cannot be signed. */
export async function saveParentSession(rawEmail: string): Promise<boolean> {
  const secret = signingSecret()
  const email = normalizeEmail(rawEmail)
  if (!secret || !EMAIL_PATTERN.test(email)) return false
  const payload = Buffer.from(email, 'utf8').toString('base64url')
  ;(await cookies()).set(PARENT_COOKIE, `${payload}.${sign(payload, secret).toString('base64url')}`, {
    httpOnly: true,
    secure: true,
    // The v0 preview renders the app inside a cross-site iframe.
    sameSite: 'none',
    path: '/',
    maxAge: PARENT_COOKIE_MAX_AGE,
  })
  return true
}
