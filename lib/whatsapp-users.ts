import type { GoogleAuth } from 'google-auth-library'
import {
  FREE_LIFETIME_TASKS,
  STANDARD_MONTHLY_TASKS,
  TASK_WINDOW_MINUTES,
  type PlanId,
} from '@/lib/plans'

const USERS_COLLECTION = 'users'
const NATIONAL_DIGITS = 10
const TASK_WINDOW_MS = TASK_WINDOW_MINUTES * 60_000

type FirestoreValue =
  | { stringValue: string }
  | { timestampValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { mapValue: unknown }
  | { arrayValue: unknown }

type FirestoreFields = Record<string, FirestoreValue>
type FirestoreDocument = { fields?: FirestoreFields }

export type TaskUsage = {
  plan: PlanId
  planExpiresAt?: Date
  freeTasksUsed: number
  periodKey?: string
  periodTasksUsed: number
  currentTaskStartedAt?: Date
}

export type UserProfile = {
  phone: string
  name?: string
  grade?: string
  country: string
  educationSystem: string
  isNew: boolean
  usage: TaskUsage
}

export type AccessDecision =
  | { allowed: true; startedTask: boolean; isLastFreeTask: boolean }
  | { allowed: false; reason: 'free_exhausted' | 'standard_limit' }

// WhatsApp sends E.164 digits without "+": 5215512345678 (MX mobile), 573001234567 (CO)...
// Firestore users/{id} always uses the 10-digit national number, so every format maps to one doc.
export function normalizePhone(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === NATIONAL_DIGITS + 3 && digits.startsWith('521')) return digits.slice(3)
  if (digits.length === NATIONAL_DIGITS + 2 && digits.startsWith('52')) return digits.slice(2)
  if (digits.length === NATIONAL_DIGITS + 1 && digits.startsWith('1')) return digits.slice(1)
  return digits.length > NATIONAL_DIGITS ? digits.slice(-NATIONAL_DIGITS) : digits
}

const COUNTRY_BY_PREFIX: Array<[string, string]> = [
  ['52', 'México'],
  ['57', 'Colombia'],
  ['54', 'Argentina'],
  ['56', 'Chile'],
  ['51', 'Perú'],
  ['593', 'Ecuador'],
  ['58', 'Venezuela'],
  ['502', 'Guatemala'],
  ['503', 'El Salvador'],
  ['504', 'Honduras'],
  ['505', 'Nicaragua'],
  ['506', 'Costa Rica'],
  ['507', 'Panamá'],
  ['591', 'Bolivia'],
  ['595', 'Paraguay'],
  ['598', 'Uruguay'],
  ['34', 'España'],
  ['1', 'Estados Unidos'],
]

const EDUCATION_SYSTEM_BY_COUNTRY: Record<string, string> = {
  México: 'SEP (Preescolar, Primaria 1º-6º, Secundaria 1º-3º, Preparatoria/Bachillerato)',
  Colombia: 'MEN (Preescolar, Básica Primaria 1º-5º, Básica Secundaria 6º-9º, Media 10º-11º)',
  Argentina: 'Nivel Inicial, Primaria, Secundaria',
  Chile: 'MINEDUC (Educación Básica 1º-8º, Educación Media 1º-4º)',
  Perú: 'MINEDU (Inicial, Primaria 1º-6º, Secundaria 1º-5º)',
  España: 'LOMLOE (Primaria 1º-6º, ESO 1º-4º, Bachillerato)',
  'Estados Unidos': 'K-12 (Elementary, Middle School, High School)',
}

function countryFromPhone(rawPhone: string): string | undefined {
  const digits = rawPhone.replace(/\D/g, '')
  if (digits.length <= NATIONAL_DIGITS) return undefined
  const prefix = digits.slice(0, digits.length - NATIONAL_DIGITS)
  const match = [...COUNTRY_BY_PREFIX]
    .sort((a, b) => b[0].length - a[0].length)
    .find(([code]) => prefix === code || prefix.startsWith(code))
  return match?.[1]
}

function readString(fields: FirestoreFields, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = fields[key]
    if (!value) continue
    if ('stringValue' in value && value.stringValue.trim()) return value.stringValue.trim()
    if ('integerValue' in value) return value.integerValue
  }
  return undefined
}

function readInt(fields: FirestoreFields, key: string): number {
  const value = fields[key]
  if (!value) return 0
  if ('integerValue' in value) return Number(value.integerValue) || 0
  if ('doubleValue' in value) return Math.floor(value.doubleValue) || 0
  return 0
}

function readDate(fields: FirestoreFields, key: string): Date | undefined {
  const value = fields[key]
  if (!value) return undefined
  const raw = 'timestampValue' in value ? value.timestampValue : 'stringValue' in value ? value.stringValue : null
  if (!raw) return undefined
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function readPlan(fields: FirestoreFields): PlanId {
  const plan = readString(fields, ['plan'])?.toLowerCase()
  if (plan === 'standard' || plan === 'estandar' || plan === 'estándar') return 'standard'
  if (plan === 'family' || plan === 'familiar' || plan === 'unlimited' || plan === 'ilimitado') return 'family'
  return 'free'
}

function buildUsage(fields: FirestoreFields): TaskUsage {
  return {
    plan: readPlan(fields),
    planExpiresAt: readDate(fields, 'plan_expires_at'),
    freeTasksUsed: readInt(fields, 'free_tasks_used'),
    periodKey: readString(fields, ['tasks_period']),
    periodTasksUsed: readInt(fields, 'period_tasks_used'),
    currentTaskStartedAt: readDate(fields, 'current_task_started_at'),
  }
}

function buildProfile(
  docId: string,
  rawPhone: string,
  fields: FirestoreFields,
  isNew: boolean,
): UserProfile {
  const country =
    readString(fields, ['country', 'pais', 'país', 'ubicacion', 'location']) ??
    countryFromPhone(rawPhone) ??
    'México'
  const educationSystem =
    readString(fields, ['education_system', 'educationSystem', 'sistema_educativo', 'curriculum']) ??
    EDUCATION_SYSTEM_BY_COUNTRY[country] ??
    'Sistema educativo local del país del estudiante'

  return {
    phone: docId,
    name: readString(fields, ['student_name', 'studentName', 'child_name', 'childName', 'name', 'nombre']),
    grade: readString(fields, ['grade', 'grado', 'school_grade', 'grado_escolar', 'nivel']),
    country,
    educationSystem,
    isNew,
    usage: buildUsage(fields),
  }
}

type FirestoreContext = { base: string; headers: Record<string, string> }

async function getFirestoreContext(auth: GoogleAuth): Promise<FirestoreContext | null> {
  const projectId = await auth
    .getProjectId()
    .catch(() => process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null)
  if (!projectId) {
    console.error('[whatsapp] Firestore project id could not be resolved')
    return null
  }
  return {
    base: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${USERS_COLLECTION}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await auth.getAccessToken()}`,
    },
  }
}

/**
 * Finds `users/{10 digits}` and returns the profile with its task usage. Existing users only get
 * `last_message_date` touched. New senders get a free-plan document with 3 lifetime tasks.
 */
export async function upsertWhatsAppUser(
  auth: GoogleAuth,
  rawPhone: string,
  firstMessageAt: Date,
): Promise<UserProfile | null> {
  const docId = normalizePhone(rawPhone)
  if (!docId) return null

  const ctx = await getFirestoreContext(auth)
  if (!ctx) return null
  const { base, headers } = ctx
  const docUrl = `${base}/${encodeURIComponent(docId)}`
  const now = new Date().toISOString()

  const existingRes = await fetch(docUrl, { headers })

  if (existingRes.ok) {
    const existing = (await existingRes.json()) as FirestoreDocument
    const updateRes = await fetch(`${docUrl}?updateMask.fieldPaths=last_message_date`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields: { last_message_date: { timestampValue: now } } }),
    })
    if (!updateRes.ok) {
      console.error(
        `[whatsapp] Firestore user update failed - status: ${updateRes.status} - body: ${await updateRes.text()}`,
      )
    }
    return buildProfile(docId, rawPhone, existing.fields ?? {}, false)
  }

  if (existingRes.status !== 404) {
    console.error(
      `[whatsapp] Firestore user lookup failed - status: ${existingRes.status} - body: ${await existingRes.text()}`,
    )
    return null
  }

  const startedAt = firstMessageAt.toISOString()
  const country = countryFromPhone(rawPhone)

  const fields: FirestoreFields = {
    phone: { stringValue: docId },
    whatsapp_id: { stringValue: rawPhone.replace(/\D/g, '') },
    created_at: { timestampValue: startedAt },
    plan: { stringValue: 'free' },
    status: { stringValue: 'free_active' },
    free_tasks_used: { integerValue: '0' },
    source: { stringValue: 'whatsapp' },
    last_message_date: { timestampValue: now },
    ...(country ? { country: { stringValue: country } } : {}),
  }

  // `documentId` makes this create-only, so a concurrent first message cannot overwrite it.
  const createRes = await fetch(`${base}?documentId=${encodeURIComponent(docId)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fields }),
  })

  if (createRes.ok) {
    console.log(`[whatsapp] Registered new user ${docId} (${FREE_LIFETIME_TASKS} free tasks)`)
    return buildProfile(docId, rawPhone, fields, true)
  }

  // 409: a concurrent message created the doc first; use the stored profile, not our draft.
  if (createRes.status === 409) {
    const storedRes = await fetch(docUrl, { headers })
    if (storedRes.ok) {
      const stored = (await storedRes.json()) as FirestoreDocument
      return buildProfile(docId, rawPhone, stored.fields ?? {}, false)
    }
  } else {
    console.error(
      `[whatsapp] Firestore user create failed - status: ${createRes.status} - body: ${await createRes.text()}`,
    )
  }

  return buildProfile(docId, rawPhone, fields, true)
}

function monthKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date)
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  return `${year}-${month}`
}

function effectivePlan(usage: TaskUsage, now: Date): PlanId {
  if (usage.plan === 'free') return 'free'
  if (usage.planExpiresAt && usage.planExpiresAt <= now) return 'free'
  return usage.plan
}

type Evaluation = { decision: AccessDecision; updates: FirestoreFields }

export function evaluateTaskAccess(usage: TaskUsage, now: Date): Evaluation {
  const plan = effectivePlan(usage, now)

  const continuingTask =
    usage.currentTaskStartedAt &&
    now.getTime() - usage.currentTaskStartedAt.getTime() < TASK_WINDOW_MS
  if (continuingTask) {
    return { decision: { allowed: true, startedTask: false, isLastFreeTask: false }, updates: {} }
  }

  const startTask = { current_task_started_at: { timestampValue: now.toISOString() } }

  if (plan === 'free') {
    if (usage.freeTasksUsed >= FREE_LIFETIME_TASKS) {
      return {
        decision: { allowed: false, reason: 'free_exhausted' },
        updates: { status: { stringValue: 'free_exhausted' } },
      }
    }
    const used = usage.freeTasksUsed + 1
    return {
      decision: { allowed: true, startedTask: true, isLastFreeTask: used === FREE_LIFETIME_TASKS },
      updates: {
        ...startTask,
        free_tasks_used: { integerValue: String(used) },
        status: { stringValue: used >= FREE_LIFETIME_TASKS ? 'free_last_task' : 'free_active' },
      },
    }
  }

  const period = monthKey(now)
  const usedThisPeriod = usage.periodKey === period ? usage.periodTasksUsed : 0

  if (plan === 'standard' && usedThisPeriod >= STANDARD_MONTHLY_TASKS) {
    return {
      decision: { allowed: false, reason: 'standard_limit' },
      updates: { tasks_period: { stringValue: period } },
    }
  }

  return {
    decision: { allowed: true, startedTask: true, isLastFreeTask: false },
    updates: {
      ...startTask,
      tasks_period: { stringValue: period },
      period_tasks_used: { integerValue: String(usedThisPeriod + 1) },
      status: { stringValue: plan },
    },
  }
}

/** Decides whether this message may reach the tutor and persists the task counters. */
export async function consumeTask(
  auth: GoogleAuth,
  profile: UserProfile,
  now: Date,
): Promise<AccessDecision> {
  const { decision, updates } = evaluateTaskAccess(profile.usage, now)
  const fieldPaths = Object.keys(updates)
  if (fieldPaths.length === 0) return decision

  const ctx = await getFirestoreContext(auth)
  if (!ctx) return decision

  const mask = fieldPaths.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&')
  const res = await fetch(`${ctx.base}/${encodeURIComponent(profile.phone)}?${mask}`, {
    method: 'PATCH',
    headers: ctx.headers,
    body: JSON.stringify({ fields: updates }),
  })
  if (!res.ok) {
    console.error(
      `[whatsapp] Firestore usage update failed - status: ${res.status} - body: ${await res.text()}`,
    )
  }
  return decision
}
