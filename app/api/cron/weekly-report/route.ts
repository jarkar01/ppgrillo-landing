import { sendWeeklyEmailReports } from '@/lib/email-reports'

export const runtime = 'nodejs'
export const maxDuration = 300

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set on the project.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[report] CRON_SECRET is not configured; refusing to run')
    return false
  }
  return request.headers.get('authorization') === `Bearer ${secret}`
}

/** ISO week in Mexico City time, e.g. "2026-W45"; used to send at most one report per week. */
function weekKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const d = new Date(Date.UTC(get('year'), get('month') - 1, get('day')))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const week = weekKey(now)
  const email = await sendWeeklyEmailReports(week, now)
  console.log(`[report] Week ${week}: ${email.sent} sent, ${email.skipped} skipped of ${email.total}`)
  return Response.json({ week, ...email })
}
