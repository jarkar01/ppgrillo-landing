import type { GoogleAuth } from 'google-auth-library'
import {
  FREE_LIFETIME_TASKS,
  STANDARD_MONTHLY_TASKS,
  TASK_IDLE_RESET_HOURS,
  type PlanId,
} from '@/lib/plans'
import type { MessageKind } from '@/lib/exercise-classifier'

const USERS_COLLECTION = 'users'
const NATIONAL_DIGITS = 10
const TASK_IDLE_RESET_MS = TASK_IDLE_RESET_HOURS * 3_600_000
const MAX_EXERCISE_CHARS = 600

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
  currentTaskText?: string
  lastTaskActivityAt?: Date
  weekKey?: string
  weekTasks: number
  weekTopics: string[]
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

const MX_COUNTRY_CODE = '52'

function cleanDigits(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '')
  return digits.startsWith('00') ? digits.slice(2) : digits
}

/**
 * Meta sends Mexican mobiles as `521` + 10 digits, while users and other systems write
 * `52` + 10, `+52 1 ...` or the bare 10 digits. Every format collapses to the 10-digit national
 * number, which is the Firestore `users/{id}`, so a returning student always hits the same doc.
 */
export function normalizePhone(rawPhone: string): string {
  const digits = cleanDigits(rawPhone)
  if (digits.length === NATIONAL_DIGITS + 3 && digits.startsWith('521')) return digits.slice(3)
  // Old Mexican long-distance mobile prefixes (044/045 + 10 digits).
  if (digits.length === NATIONAL_DIGITS + 3 && /^04[45]/.test(digits)) return digits.slice(3)
  if (digits.length === NATIONAL_DIGITS + 2 && digits.startsWith(MX_COUNTRY_CODE)) return digits.slice(2)
  if (digits.length === NATIONAL_DIGITS + 1 && digits.startsWith('1')) return digits.slice(1)
  return digits.length > NATIONAL_DIGITS ? digits.slice(-NATIONAL_DIGITS) : digits
}

/** Country code + 10 digits without the Mexican mobile "1": 5215512345678 -> 525512345678. */
export function phoneE164(rawPhone: string): string {
  const digits = cleanDigits(rawPhone)
  const national = normalizePhone(rawPhone)
  if (digits.length <= NATIONAL_DIGITS) return `${MX_COUNTRY_CODE}${national}`
  const prefix = digits.slice(0, digits.length - NATIONAL_DIGITS)
  const countryCode = prefix === '521' || /^04[45]$/.test(prefix) ? MX_COUNTRY_CODE : prefix
  return `${countryCode}${national}`
}

/** IDs older versions or manual imports may have used for the same number. */
function legacyPhoneIds(rawPhone: string): string[] {
  const docId = normalizePhone(rawPhone)
  const digits = cleanDigits(rawPhone)
  const e164 = phoneE164(rawPhone)
  const ids = [digits, `+${digits}`, e164, `+${e164}`]
  if (e164.startsWith(MX_COUNTRY_CODE)) ids.push(`521${docId}`, `+521${docId}`)
  return [...new Set(ids)].filter((id) => id && id !== docId)
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
    currentTaskText: readString(fields, ['current_task_text']),
    lastTaskActivityAt: readDate(fields, 'last_task_activity_at'),
    weekKey: readString(fields, ['week_key']),
    weekTasks: readInt(fields, 'week_tasks'),
    weekTopics: splitTopics(readString(fields, ['week_topics'])),
  }
}

const MAX_WEEK_TOPICS = 8
const MAX_TOPIC_LENGTH = 80

function splitTopics(raw: string | undefined): string[] {
  return raw ? raw.split('\n').filter(Boolean) : []
}

function topicFromMessage(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > MAX_TOPIC_LENGTH ? `${clean.slice(0, MAX_TOPIC_LENGTH - 1)}…` : clean
}

/** ISO week (e.g. "2026-W43") in Mexico City time, so the Sunday report covers Monday–Sunday. */
export function weekKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const local = new Date(Date.UTC(get('year'), get('month') - 1, get('day')))
  const dayOfWeek = local.getUTCDay() || 7
  local.setUTCDate(local.getUTCDate() + 4 - dayOfWeek)
  const yearStart = new Date(Date.UTC(local.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((local.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${local.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
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

type LegacyUser = { id: string; fields: FirestoreFields }

/**
 * Looks for the same number saved under an older ID (e.g. `5215512345678`, `+525512345678`)
 * or with a different `phone`/`whatsapp_id` field, so returning students keep their profile.
 */
async function findLegacyUser(ctx: FirestoreContext, rawPhone: string): Promise<LegacyUser | null> {
  const ids = legacyPhoneIds(rawPhone)

  for (const id of ids) {
    const res = await fetch(`${ctx.base}/${encodeURIComponent(id)}`, { headers: ctx.headers })
    if (res.ok) {
      const doc = (await res.json()) as FirestoreDocument
      if (!readString(doc.fields ?? {}, ['merged_into'])) return { id, fields: doc.fields ?? {} }
    }
  }

  const documentsRoot = ctx.base.slice(0, -`/${USERS_COLLECTION}`.length)
  const values = [normalizePhone(rawPhone), ...ids].map((v) => ({ stringValue: v }))

  for (const fieldPath of ['whatsapp_id', 'phone', 'phone_e164']) {
    const res = await fetch(`${documentsRoot}:runQuery`, {
      method: 'POST',
      headers: ctx.headers,
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: USERS_COLLECTION }],
          where: { fieldFilter: { field: { fieldPath }, op: 'IN', value: { arrayValue: { values } } } },
          limit: 5,
        },
      }),
    })
    if (!res.ok) {
      console.error(`[whatsapp] Legacy user query failed - status: ${res.status} - body: ${await res.text()}`)
      continue
    }
    const rows = (await res.json()) as Array<{ document?: { name: string; fields?: FirestoreFields } }>
    const match = rows.find((r) => r.document && !readString(r.document.fields ?? {}, ['merged_into']))
    if (match?.document) {
      return { id: match.document.name.split('/').pop() ?? '', fields: match.document.fields ?? {} }
    }
  }

  return null
}

/** Copies a legacy profile into `users/{10 digits}` and marks the old doc as merged. */
async function migrateLegacyUser(
  ctx: FirestoreContext,
  docId: string,
  rawPhone: string,
  legacy: LegacyUser,
  now: string,
): Promise<FirestoreFields | null> {
  const fields: FirestoreFields = {
    ...legacy.fields,
    phone: { stringValue: docId },
    phone_e164: { stringValue: phoneE164(rawPhone) },
    whatsapp_id: { stringValue: rawPhone.replace(/\D/g, '') },
    legacy_doc_id: { stringValue: legacy.id },
    last_message_date: { timestampValue: now },
  }

  const createRes = await fetch(`${ctx.base}?documentId=${encodeURIComponent(docId)}`, {
    method: 'POST',
    headers: ctx.headers,
    body: JSON.stringify({ fields }),
  })

  if (!createRes.ok && createRes.status !== 409) {
    console.error(
      `[whatsapp] Legacy user migration failed - status: ${createRes.status} - body: ${await createRes.text()}`,
    )
    return legacy.fields
  }

  if (legacy.id !== docId) {
    await fetch(`${ctx.base}/${encodeURIComponent(legacy.id)}?updateMask.fieldPaths=merged_into`, {
      method: 'PATCH',
      headers: ctx.headers,
      body: JSON.stringify({ fields: { merged_into: { stringValue: docId } } }),
    })
  }

  console.log(`[whatsapp] Migrated legacy user ${legacy.id} -> ${docId}`)
  return fields
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

  const legacy = await findLegacyUser(ctx, rawPhone)
  if (legacy) {
    const migrated = await migrateLegacyUser(ctx, docId, rawPhone, legacy, now)
    if (migrated) return buildProfile(docId, rawPhone, migrated, false)
  }

  const startedAt = firstMessageAt.toISOString()
  const country = countryFromPhone(rawPhone)

  const fields: FirestoreFields = {
    phone: { stringValue: docId },
    phone_e164: { stringValue: phoneE164(rawPhone) },
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

function weeklyActivityUpdates(usage: TaskUsage, now: Date, topic: string): FirestoreFields {
  const week = weekKey(now)
  const sameWeek = usage.weekKey === week
  const topics = [...(sameWeek ? usage.weekTopics : []), topicFromMessage(topic)]
    .filter(Boolean)
    .slice(-MAX_WEEK_TOPICS)
  return {
    week_key: { stringValue: week },
    week_tasks: { integerValue: String((sameWeek ? usage.weekTasks : 0) + 1) },
    week_topics: { stringValue: topics.join('\n') },
  }
}

/** The exercise in progress, unless it has been idle long enough to be considered finished. */
export function activeExercise(usage: TaskUsage, now: Date): string | undefined {
  const lastActivity = usage.lastTaskActivityAt ?? usage.currentTaskStartedAt
  if (!usage.currentTaskText || !lastActivity) return undefined
  return now.getTime() - lastActivity.getTime() < TASK_IDLE_RESET_MS ? usage.currentTaskText : undefined
}

function isFreeExhausted(usage: TaskUsage, now: Date) {
  return effectivePlan(usage, now) === 'free' && usage.freeTasksUsed >= FREE_LIFETIME_TASKS
}

const blockedFree: Evaluation = {
  decision: { allowed: false, reason: 'free_exhausted' },
  updates: { status: { stringValue: 'free_exhausted' } },
}

/**
 * 1 tarea = 1 ejercicio completo. Follow-up messages about the active exercise never consume a
 * task; only a NEW exercise does. Free users get 3 lifetime exercises; the 4th is blocked.
 */
export function evaluateTaskAccess(
  usage: TaskUsage,
  now: Date,
  kind: MessageKind,
  message = '',
): Evaluation {
  const plan = effectivePlan(usage, now)
  const current = activeExercise(usage, now)

  if (kind === 'same' && current) {
    return {
      decision: { allowed: true, startedTask: false, isLastFreeTask: false },
      updates: { last_task_activity_at: { timestampValue: now.toISOString() } },
    }
  }

  if (kind === 'other') {
    // Exhausted free users only keep access to the exercise they were already solving.
    if (isFreeExhausted(usage, now)) return blockedFree
    return { decision: { allowed: true, startedTask: false, isLastFreeTask: false }, updates: {} }
  }

  const topic = message
  const startTask: FirestoreFields = {
    current_task_started_at: { timestampValue: now.toISOString() },
    last_task_activity_at: { timestampValue: now.toISOString() },
    current_task_text: { stringValue: message.replace(/\s+/g, ' ').trim().slice(0, MAX_EXERCISE_CHARS) },
  }

  if (plan === 'free') {
    if (usage.freeTasksUsed >= FREE_LIFETIME_TASKS) return blockedFree
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
      ...weeklyActivityUpdates(usage, now, topic),
      tasks_period: { stringValue: period },
      period_tasks_used: { integerValue: String(usedThisPeriod + 1) },
      status: { stringValue: plan },
    },
  }
}

function applyUpdatesLocally(usage: TaskUsage, updates: FirestoreFields) {
  const next = buildUsage({ ...usageToFields(usage), ...updates })
  Object.assign(usage, next)
}

function usageToFields(usage: TaskUsage): FirestoreFields {
  const fields: FirestoreFields = {
    plan: { stringValue: usage.plan },
    free_tasks_used: { integerValue: String(usage.freeTasksUsed) },
    period_tasks_used: { integerValue: String(usage.periodTasksUsed) },
    week_tasks: { integerValue: String(usage.weekTasks) },
    week_topics: { stringValue: usage.weekTopics.join('\n') },
  }
  if (usage.planExpiresAt) fields.plan_expires_at = { timestampValue: usage.planExpiresAt.toISOString() }
  if (usage.periodKey) fields.tasks_period = { stringValue: usage.periodKey }
  if (usage.weekKey) fields.week_key = { stringValue: usage.weekKey }
  if (usage.currentTaskText) fields.current_task_text = { stringValue: usage.currentTaskText }
  if (usage.currentTaskStartedAt)
    fields.current_task_started_at = { timestampValue: usage.currentTaskStartedAt.toISOString() }
  if (usage.lastTaskActivityAt)
    fields.last_task_activity_at = { timestampValue: usage.lastTaskActivityAt.toISOString() }
  return fields
}

/**
 * Decides whether this message may reach the tutor and persists the task state in Firestore.
 * `profile.usage` is updated in place so later messages in the same webhook batch see it.
 */
export async function consumeTask(
  auth: GoogleAuth,
  profile: UserProfile,
  now: Date,
  kind: MessageKind,
  message = '',
): Promise<AccessDecision> {
  const { decision, updates } = evaluateTaskAccess(profile.usage, now, kind, message)
  const fieldPaths = Object.keys(updates)
  if (fieldPaths.length === 0) return decision
  applyUpdatesLocally(profile.usage, updates)

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

export type ReportRecipient = {
  docId: string
  recipient: string
  studentName?: string
  plan: Exclude<PlanId, 'free'>
  weekTasks: number
  weekTopics: string[]
}

type RunQueryRow = { document?: { name: string; fields?: FirestoreFields } }

/**
 * Paid subscribers (Estándar and Familiar) who have not received the report for `week` yet.
 * Reports go to `parent_phone` when the family registered one, otherwise to the student's line.
 */
export async function listReportRecipients(
  auth: GoogleAuth,
  week: string,
  now: Date,
): Promise<ReportRecipient[]> {
  const ctx = await getFirestoreContext(auth)
  if (!ctx) return []
  const documentsRoot = ctx.base.slice(0, -`/${USERS_COLLECTION}`.length)

  const res = await fetch(`${documentsRoot}:runQuery`, {
    method: 'POST',
    headers: ctx.headers,
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: USERS_COLLECTION }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'plan' },
            op: 'IN',
            value: {
              arrayValue: {
                values: ['standard', 'family', 'estandar', 'estándar', 'familiar'].map((v) => ({
                  stringValue: v,
                })),
              },
            },
          },
        },
      },
    }),
  })

  if (!res.ok) {
    console.error(`[report] Firestore runQuery failed - status: ${res.status} - body: ${await res.text()}`)
    return []
  }

  const rows = (await res.json()) as RunQueryRow[]
  const recipients: ReportRecipient[] = []

  for (const row of rows) {
    if (!row.document) continue
    const fields = row.document.fields ?? {}
    const docId = row.document.name.split('/').pop() ?? ''
    const usage = buildUsage(fields)
    const plan = effectivePlan(usage, now)
    if (plan === 'free') continue
    if (readString(fields, ['last_report_week']) === week) continue

    const parentPhone = readString(fields, ['parent_phone', 'telefono_padre', 'parentPhone'])
    const whatsappId = readString(fields, ['whatsapp_id'])
    const recipient = (parentPhone ?? whatsappId ?? `52${docId}`).replace(/\D/g, '')
    if (!recipient) continue

    const sameWeek = usage.weekKey === week
    recipients.push({
      docId,
      recipient,
      studentName: readString(fields, ['student_name', 'studentName', 'child_name', 'name', 'nombre']),
      plan,
      weekTasks: sameWeek ? usage.weekTasks : 0,
      weekTopics: sameWeek ? usage.weekTopics : [],
    })
  }

  return recipients
}

export async function markReportSent(auth: GoogleAuth, docId: string, week: string, now: Date) {
  const ctx = await getFirestoreContext(auth)
  if (!ctx) return
  const mask = ['last_report_week', 'last_report_at']
    .map((f) => `updateMask.fieldPaths=${f}`)
    .join('&')
  const res = await fetch(`${ctx.base}/${encodeURIComponent(docId)}?${mask}`, {
    method: 'PATCH',
    headers: ctx.headers,
    body: JSON.stringify({
      fields: {
        last_report_week: { stringValue: week },
        last_report_at: { timestampValue: now.toISOString() },
      },
    }),
  })
  if (!res.ok) {
    console.error(`[report] Firestore mark sent failed - status: ${res.status} - body: ${await res.text()}`)
  }
}
