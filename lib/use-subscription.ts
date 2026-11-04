'use client'

import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { readPaidSession, savePaidSession, usePaidSession } from '@/lib/paid-session'
import type { PaidPlanId } from '@/lib/plans'

export type ClientSubscription = {
  status: 'active' | 'pending_payment' | 'expired' | 'none' | 'unknown'
  plan?: PaidPlanId
  expiresAt?: string
  /** The server resolved a verified parent email for this device. */
  linked?: boolean
  email?: string
  name?: string
}

const CHECKOUT_STARTED_KEY = 'ppgrillo:checkout-started'
const ACTIVATION_WINDOW_MS = 30 * 60 * 1000
const FAST_POLL_MS = 3_000
const SLOW_POLL_MS = 10_000
/** After this long without confirmation, the UI explains the delay but keeps checking on its own. */
export const ACTIVATION_PATIENCE_MS = 90_000

const MP_RETURN_PARAMS = ['payment_id', 'collection_id', 'collection_status', 'preference_id', 'merchant_order_id']
const MP_FAILED_STATUSES = new Set(['rejected', 'failure', 'cancelled', 'null'])

/** Marks the moment the family leaves for Mercado Pago so /app knows to watch for the activation. */
export function markCheckoutStarted() {
  try {
    window.localStorage.setItem(CHECKOUT_STARTED_KEY, String(Date.now()))
  } catch {
    // Storage may be unavailable; the Mercado Pago return params still trigger the check.
  }
}

function readCheckoutStarted(): number | null {
  try {
    const value = Number(window.localStorage.getItem(CHECKOUT_STARTED_KEY))
    return Number.isFinite(value) && value > 0 && Date.now() - value < ACTIVATION_WINDOW_MS ? value : null
  } catch {
    return null
  }
}

function clearCheckoutStarted() {
  try {
    window.localStorage.removeItem(CHECKOUT_STARTED_KEY)
  } catch {}
}

type ReturnInfo = { paymentId?: string; failed: boolean; returned: boolean }

function readReturnInfo(): ReturnInfo {
  const params = new URLSearchParams(window.location.search)
  const returned = MP_RETURN_PARAMS.some((key) => params.has(key))
  const status = (params.get('collection_status') ?? params.get('status') ?? '').toLowerCase()
  const paymentId = params.get('payment_id') ?? params.get('collection_id') ?? undefined
  return {
    returned,
    paymentId: paymentId && /^\d+$/.test(paymentId) ? paymentId : undefined,
    failed: returned && MP_FAILED_STATUSES.has(status),
  }
}

function stripReturnParams() {
  const url = new URL(window.location.href)
  let changed = false
  for (const key of [...MP_RETURN_PARAMS, 'status', 'external_reference', 'payment_type', 'site_id', 'processing_mode', 'merchant_account_id']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  }
  if (changed) window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
}

async function fetchSubscription(url: string): Promise<ClientSubscription> {
  const res = await fetch(url, { cache: 'no-store' })
  const data = (await res.json().catch(() => ({ status: 'unknown' }))) as ClientSubscription
  return res.ok ? data : { status: 'unknown' }
}

export type SubscriptionState = {
  subscription: ClientSubscription | undefined
  /** Chat is unlocked: Firestore confirms the plan, or this is a paid device and the check is still pending. */
  active: boolean
  /** This device belongs to a family that paid (verified email stored locally). Never shows plans. */
  paidDevice: boolean
  /** Paid device whose server session was lost (cookies cleared); the email must be confirmed again. */
  needsReverify: boolean
  /** Paid device linked to its email while Firestore does not show the plan as active yet. */
  confirming: boolean
  /** The plan linked to this device ended; renewal is the only case where plans are shown to a payer. */
  expired: boolean
  /** The first server answer arrived (or the device is already known to be paid). */
  resolved: boolean
  paidEmail?: string
  paidPlan?: PaidPlanId
  /** True while we wait for Mercado Pago to confirm a payment the family just made. */
  activating: boolean
  /** Confirmation is taking longer than usual; polling continues in the background. */
  delayed: boolean
  /** Mercado Pago returned with a rejected or cancelled payment. */
  paymentFailed: boolean
  /** Set once the plan turns active during this visit, to celebrate it. */
  justActivated: boolean
  checkNow: () => void
}

export function useSubscription(): SubscriptionState {
  const [watch, setWatch] = useState<{ since: number; paymentId?: string; failed: boolean } | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [justActivated, setJustActivated] = useState(false)

  useEffect(() => {
    const info = readReturnInfo()
    const startedAt = readCheckoutStarted()
    if (info.failed) {
      setWatch({ since: Date.now(), failed: true })
    } else if (info.returned || startedAt) {
      setWatch({ since: info.returned ? Date.now() : (startedAt ?? Date.now()), paymentId: info.paymentId, failed: false })
    }
  }, [])

  const paid = usePaidSession()
  const watching = watch !== null && !watch.failed
  const key = watch?.paymentId
    ? `/api/web/subscription?payment_id=${encodeURIComponent(watch.paymentId)}`
    : '/api/web/subscription'

  const { data, mutate } = useSWR<ClientSubscription>(key, fetchSubscription, {
    refreshInterval: (latest) => {
      if (latest?.status === 'active') return 0
      if (watching) return now - (watch?.since ?? now) < ACTIVATION_PATIENCE_MS ? FAST_POLL_MS : SLOW_POLL_MS
      // A paying device keeps checking until Firestore confirms the plan again.
      return readPaidSession() && latest?.status !== 'expired' ? SLOW_POLL_MS : 0
    },
    revalidateOnFocus: true,
    keepPreviousData: true,
  })

  const serverActive = data?.status === 'active'
  const expired = data?.status === 'expired'
  const pending = data === undefined || data.status === 'unknown'
  const paidDevice = Boolean(paid) && !expired
  const needsReverify = paidDevice && !pending && data?.linked !== true
  const confirming = paidDevice && !pending && data?.linked === true && !serverActive
  const active = serverActive || (paidDevice && pending)

  useEffect(() => {
    if (serverActive && data?.email) savePaidSession({ email: data.email, plan: data.plan, name: data.name })
  }, [serverActive, data?.email, data?.plan, data?.name])

  useEffect(() => {
    if (!watching) return
    if (serverActive) {
      clearCheckoutStarted()
      stripReturnParams()
      setJustActivated(true)
      setWatch(null)
      return
    }
    const timer = window.setInterval(() => setNow(Date.now()), 5_000)
    return () => window.clearInterval(timer)
  }, [watching, serverActive])

  const checkNow = useCallback(() => {
    void mutate()
  }, [mutate])

  return {
    subscription: data,
    active,
    paidDevice,
    needsReverify,
    confirming,
    expired,
    resolved: !pending || Boolean(paid),
    paidEmail: data?.email ?? paid?.email,
    paidPlan: paid?.plan,
    activating: watching && !serverActive,
    delayed: watching && !serverActive && now - (watch?.since ?? now) >= ACTIVATION_PATIENCE_MS,
    paymentFailed: watch?.failed === true && !serverActive,
    justActivated,
    checkNow,
  }
}
