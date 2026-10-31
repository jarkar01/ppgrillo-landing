import { firestoreContext, patchDocument, type FirestoreFields } from '@/lib/web-users'

const USERS = 'users'
const WEB_USERS = 'web_users'
const REQUEST_TIMEOUT_MS = 10_000

export type EmailReportRecipient = {
  docId: string
  email: string
  studentName?: string
  plan: string
  webUserId?: string
  totalTasks: number
  currentTask?: string
}

export type ReportEmail = { subject: string; text: string; html: string }

export type EmailSendResult = { ok: true } | { ok: false; reason: string }

/**
 * Delivery adapter for weekly reports. No email provider is connected yet, so it reports
 * `not_configured` and the cron leaves the week unmarked to retry once a sender is wired in.
 */
export async function sendReportEmail(_to: string, _email: ReportEmail): Promise<EmailSendResult> {
  return { ok: false, reason: 'email_sender_not_configured' }
}

function str(fields: FirestoreFields, key: string): string | undefined {
  const value = fields[key]
  return value && 'stringValue' in value && value.stringValue ? value.stringValue : undefined
}

function int(fields: FirestoreFields, key: string): number {
  const value = fields[key]
  return value && 'integerValue' in value ? Number(value.integerValue) || 0 : 0
}

type RunQueryRow = { document?: { name: string; fields?: FirestoreFields } }

/** Parents with a confirmed paid plan who have not received the report for `week` yet. */
export async function listEmailReportRecipients(week: string): Promise<EmailReportRecipient[]> {
  const ctx = await firestoreContext()
  if (!ctx) return []

  const res = await fetch(`${ctx.base}:runQuery`, {
    method: 'POST',
    headers: ctx.headers,
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: USERS }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'report_channel' }, op: 'EQUAL', value: { stringValue: 'email' } } },
              { fieldFilter: { field: { fieldPath: 'plan_status' }, op: 'EQUAL', value: { stringValue: 'active' } } },
            ],
          },
        },
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!res.ok) {
    console.error('[email-report] Firestore runQuery failed:', res.status, await res.text())
    return []
  }

  const rows = (await res.json()) as RunQueryRow[]
  const candidates = rows.flatMap((row) => {
    if (!row.document) return []
    const fields = row.document.fields ?? {}
    const email = str(fields, 'email')
    if (!email || str(fields, 'last_report_week') === week) return []
    return [
      {
        docId: row.document.name.split('/').pop() ?? '',
        email,
        studentName: str(fields, 'student_name'),
        plan: str(fields, 'checkout_plan') ?? 'standard',
        webUserId: str(fields, 'web_user_id'),
      },
    ]
  })

  return Promise.all(
    candidates.map(async (c) => {
      const progress = c.webUserId ? await readWebUserProgress(ctx, c.webUserId) : undefined
      return { ...c, totalTasks: progress?.totalTasks ?? 0, currentTask: progress?.currentTask }
    }),
  )
}

async function readWebUserProgress(
  ctx: { base: string; headers: Record<string, string> },
  webUserId: string,
): Promise<{ totalTasks: number; currentTask?: string } | undefined> {
  try {
    const res = await fetch(`${ctx.base}/${WEB_USERS}/${encodeURIComponent(webUserId)}`, {
      headers: ctx.headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!res.ok) return undefined
    const fields = ((await res.json()) as { fields?: FirestoreFields }).fields ?? {}
    return { totalTasks: int(fields, 'task_count'), currentTask: str(fields, 'current_task_text') }
  } catch {
    return undefined
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

export function buildParentReportEmail(r: EmailReportRecipient): ReportEmail {
  const name = r.studentName ?? 'tu hijo(a)'
  const paragraphs = [
    `Hola, este es el reporte semanal de avance de ${name} en PpGrillo.`,
    r.totalTasks > 0
      ? `Hasta ahora ha trabajado ${r.totalTasks} ${r.totalTasks === 1 ? 'tarea' : 'tareas'} razonando paso a paso con el método socrático.`
      : 'Todavía no hay tareas registradas. Cuando tenga una duda, puede abrir PpGrillo en https://ppgrillo.io/app.',
    ...(r.currentTask ? [`Tarea más reciente: "${r.currentTask}".`] : []),
    'Tip para conversar en familia: pídele que te explique con sus palabras lo que aprendió esta semana.',
  ]
  return {
    subject: `Reporte semanal PpGrillo · ${name}`,
    text: paragraphs.join('\n\n'),
    html: paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join(''),
  }
}

export async function sendWeeklyEmailReports(week: string, now: Date) {
  const recipients = await listEmailReportRecipients(week)
  let sent = 0
  let skipped = 0

  for (const r of recipients) {
    const result = await sendReportEmail(r.email, buildParentReportEmail(r))
    if (result.ok) {
      sent++
      await patchDocument(`${USERS}/${r.docId}`, {
        last_report_week: { stringValue: week },
        last_report_at: { timestampValue: now.toISOString() },
      })
    } else {
      skipped++
    }
  }

  if (skipped > 0) console.log(`[email-report] Week ${week}: ${skipped} not sent (sender not configured)`)
  return { total: recipients.length, sent, skipped }
}
