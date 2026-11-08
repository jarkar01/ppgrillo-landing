import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * The admin dashboard is guarded by a dedicated `ADMIN_PASSWORD`, independent from parent
 * emails (parent access is one-click by email, so an email alone must never grant admin rights).
 */
export const ADMIN_COOKIE = 'ppg_admin'
const ADMIN_SESSION_SECONDS = 60 * 60 * 12

function adminSecret(): Buffer | null {
  const password = process.env.ADMIN_PASSWORD
  return password ? createHash('sha256').update(`ppg-admin-session:${password}`).digest() : null
}

function sign(payload: string, secret: Buffer): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const left = createHash('sha256').update(a).digest()
  const right = createHash('sha256').update(b).digest()
  return timingSafeEqual(left, right)
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

export function verifyAdminPassword(candidate: string): boolean {
  const password = process.env.ADMIN_PASSWORD
  return Boolean(password) && safeEqual(candidate, password!)
}

export async function startAdminSession(): Promise<void> {
  const secret = adminSecret()
  if (!secret) return
  const payload = String(Date.now() + ADMIN_SESSION_SECONDS * 1000)
  ;(await cookies()).set(ADMIN_COOKIE, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    secure: true,
    // The v0 preview renders the app inside a cross-site iframe.
    sameSite: 'none',
    path: '/',
    maxAge: ADMIN_SESSION_SECONDS,
  })
}

export async function endAdminSession(): Promise<void> {
  ;(await cookies()).delete(ADMIN_COOKIE)
}

export async function isAdminSession(): Promise<boolean> {
  const secret = adminSecret()
  const value = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!secret || !value) return false
  const [payload, signature] = value.split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) return false
  return Number(payload) > Date.now()
}
