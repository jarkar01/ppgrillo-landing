import { firestoreContext } from '@/lib/parent-users'
import { FAMILY_PRICE_MXN, FREE_LIFETIME_TASKS, STANDARD_MONTHLY_TASKS, STANDARD_PRICE_MXN } from '@/lib/plans'

export type AdminPlan = 'free' | 'standard' | 'family'
export type AdminStatus = 'trial' | 'trial_ended' | 'active'

export type AdminUserRow = {
  email: string
  name?: string
  plan: AdminPlan
  planLabel: string
  planStatus: string
  tasksUsed: number
  /** null = unlimited. */
  tasksLimit: number | null
  tasksScope: 'lifetime' | 'month'
  status: AdminStatus
  lastTaskAt?: string
  updatedAt?: string
}

type RawValue = {
  stringValue?: string
  integerValue?: string
  doubleValue?: number
  timestampValue?: string
  mapValue?: { fields?: Record<string, RawValue> }
}
type RawFields = Record<string, RawValue>

const PAGE_SIZE = 300
const MAX_PAGES = 20

/** Month key used for the per-month task counter, e.g. `m2026_11`. */
export function monthKey(date = new Date()): string {
  return `m${date.getUTCFullYear()}_${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function str(fields: RawFields, key: string): string | undefined {
  return fields[key]?.stringValue || undefined
}

function int(value: RawValue | undefined): number {
  if (!value) return 0
  const n = value.integerValue !== undefined ? Number(value.integerValue) : Number(value.doubleValue ?? 0)
  return Number.isFinite(n) ? n : 0
}

function toRow(email: string, fields: RawFields): AdminUserRow {
  const active = str(fields, 'plan_status') === 'active'
  const rawPlan = str(fields, 'paid_plan') ?? str(fields, 'plan') ?? str(fields, 'checkout_plan')
  const plan: AdminPlan = active && (rawPlan === 'standard' || rawPlan === 'family') ? rawPlan : 'free'
  const monthTasks = int(fields.tasks_by_month?.mapValue?.fields?.[monthKey()])
  const totalTasks = int(fields.tasks_used_total)

  const base = {
    email,
    name: str(fields, 'student_name') ?? str(fields, 'parent_name') ?? str(fields, 'name'),
    planStatus: str(fields, 'plan_status') ?? 'none',
    lastTaskAt: fields.last_task_at?.timestampValue,
    updatedAt: fields.updated_at?.timestampValue,
  }

  if (plan === 'standard') {
    return {
      ...base,
      plan,
      planLabel: `Estándar $${STANDARD_PRICE_MXN}`,
      tasksUsed: monthTasks,
      tasksLimit: STANDARD_MONTHLY_TASKS,
      tasksScope: 'month',
      status: 'active',
    }
  }
  if (plan === 'family') {
    return {
      ...base,
      plan,
      planLabel: `Familiar $${FAMILY_PRICE_MXN}`,
      tasksUsed: monthTasks,
      tasksLimit: null,
      tasksScope: 'month',
      status: 'active',
    }
  }
  const trialUsed = Math.max(totalTasks, int(fields.trial_tasks_used))
  return {
    ...base,
    plan,
    planLabel: 'Gratuito',
    tasksUsed: Math.min(trialUsed, FREE_LIFETIME_TASKS),
    tasksLimit: FREE_LIFETIME_TASKS,
    tasksScope: 'lifetime',
    status: trialUsed >= FREE_LIFETIME_TASKS ? 'trial_ended' : 'trial',
  }
}

/** Lists every family in `users/{email}`. Returns 'error' when Firestore cannot be reached. */
export async function listAdminUsers(): Promise<AdminUserRow[] | 'error'> {
  try {
    const ctx = await firestoreContext()
    if (!ctx) return 'error'
    const rows: AdminUserRow[] = []
    let pageToken: string | undefined
    for (let page = 0; page < MAX_PAGES; page++) {
      const url = new URL(`${ctx.base}/users`)
      url.searchParams.set('pageSize', String(PAGE_SIZE))
      if (pageToken) url.searchParams.set('pageToken', pageToken)
      const res = await fetch(url, { headers: ctx.headers, cache: 'no-store', signal: AbortSignal.timeout(10_000) })
      if (!res.ok) throw new Error(`users list failed: ${res.status} ${await res.text()}`)
      const body = (await res.json()) as { documents?: { name: string; fields?: RawFields }[]; nextPageToken?: string }
      for (const doc of body.documents ?? []) {
        const id = decodeURIComponent(doc.name.split('/').pop() ?? '')
        const fields = doc.fields ?? {}
        const email = (str(fields, 'parent_email') ?? id).toLowerCase()
        if (email.includes('@')) rows.push(toRow(email, fields))
      }
      pageToken = body.nextPageToken
      if (!pageToken) break
    }
    return rows.sort((a, b) => (b.lastTaskAt ?? b.updatedAt ?? '').localeCompare(a.lastTaskAt ?? a.updatedAt ?? ''))
  } catch (error) {
    console.error('[admin] Users list failed:', error)
    return 'error'
  }
}

/**
 * Atomically records one new task for a family: lifetime total, current month bucket and
 * last activity. Used by the tutor so the admin dashboard reflects real usage.
 */
export async function recordTaskUsage(email: string, trialTasksUsed: number): Promise<void> {
  try {
    const ctx = await firestoreContext()
    if (!ctx) return
    const document = `${ctx.base.replace(/^https:\/\/firestore\.googleapis\.com\/v1\//, '')}/users/${encodeURIComponent(email)}`
    const now = new Date().toISOString()
    const res = await fetch(`${ctx.base}:commit`, {
      method: 'POST',
      headers: ctx.headers,
      signal: AbortSignal.timeout(5_000),
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: document,
              fields: {
                parent_email: { stringValue: email },
                last_task_at: { timestampValue: now },
                trial_tasks_used: { integerValue: String(Math.min(trialTasksUsed, FREE_LIFETIME_TASKS)) },
              },
            },
            updateMask: { fieldPaths: ['parent_email', 'last_task_at', 'trial_tasks_used'] },
            updateTransforms: [
              { fieldPath: 'tasks_used_total', increment: { integerValue: '1' } },
              { fieldPath: `tasks_by_month.${monthKey()}`, increment: { integerValue: '1' } },
            ],
          },
        ],
      }),
    })
    if (!res.ok) console.error('[admin] Task usage write failed:', res.status, await res.text())
  } catch (error) {
    console.error('[admin] Task usage write error:', error)
  }
}
