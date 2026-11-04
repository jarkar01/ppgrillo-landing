'use client'

import { useSyncExternalStore } from 'react'
import type { PaidPlanId } from '@/lib/plans'

/**
 * The verified parent email of a family that paid, kept on the device. It is never cleared
 * automatically: once a device is known to belong to a paying family it never goes back to the
 * anonymous free-trial state. Access itself is still enforced server-side by Firestore.
 */
export type PaidSession = {
  email: string
  plan?: PaidPlanId
  name?: string
  verifiedAt: number
}

const STORAGE_KEY = 'ppgrillo:paid-session'
const CHANGE_EVENT = 'ppgrillo:paid-session-change'

let cachedRaw: string | null = null
let cachedValue: PaidSession | null = null

function parse(raw: string | null): PaidSession | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<PaidSession>
    if (typeof data.email !== 'string' || !data.email.includes('@')) return null
    return {
      email: data.email,
      plan: data.plan === 'standard' || data.plan === 'family' ? data.plan : undefined,
      name: typeof data.name === 'string' && data.name.trim() ? data.name : undefined,
      verifiedAt: typeof data.verifiedAt === 'number' ? data.verifiedAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function readPaidSession(): PaidSession | null {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedValue = parse(raw)
  }
  return cachedValue
}

export function savePaidSession(session: Omit<PaidSession, 'verifiedAt'>) {
  const current = readPaidSession()
  const next: PaidSession = {
    email: session.email.trim().toLowerCase(),
    plan: session.plan ?? current?.plan,
    name: session.name ?? current?.name,
    verifiedAt: Date.now(),
  }
  if (current && current.email === next.email && current.plan === next.plan && current.name === next.name) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage can be unavailable (private mode); the signed server cookie still anchors the session.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

/** Returns `undefined` until hydrated, then the stored paid session or `null`. */
export function usePaidSession(): PaidSession | null | undefined {
  return useSyncExternalStore(subscribe, readPaidSession, () => undefined)
}
