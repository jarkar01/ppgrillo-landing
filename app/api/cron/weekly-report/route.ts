import { getGoogleAuth } from '@/lib/google-auth'
import { buildParentReportTemplateParams, buildParentReportText } from '@/lib/parent-report'
import { sendWhatsAppTemplate, sendWhatsAppText } from '@/lib/whatsapp-cloud'
import { listReportRecipients, markReportSent, weekKey } from '@/lib/whatsapp-users'

export const runtime = 'nodejs'
export const maxDuration = 300

const BATCH_SIZE = 10

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set on the project.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[report] CRON_SECRET is not configured; refusing to run')
    return false
  }
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const auth = getGoogleAuth()
  if (!auth) return Response.json({ error: 'google_auth_unavailable' }, { status: 500 })

  const now = new Date()
  const week = weekKey(now)
  const recipients = await listReportRecipients(auth, week, now)

  // Business-initiated messages outside the 24h window must use a Meta-approved template.
  const templateName = process.env.WHATSAPP_REPORT_TEMPLATE
  const templateLanguage = process.env.WHATSAPP_REPORT_TEMPLATE_LANG || 'es_MX'

  let sent = 0
  let failed = 0

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async (r) => {
        const result = templateName
          ? await sendWhatsAppTemplate(
              r.recipient,
              templateName,
              templateLanguage,
              buildParentReportTemplateParams(r),
            )
          : await sendWhatsAppText(r.recipient, buildParentReportText(r))

        if (result.ok) {
          sent++
          await markReportSent(auth, r.docId, week, now)
        } else {
          failed++
        }
      }),
    )
  }

  console.log(`[report] Week ${week}: ${sent} sent, ${failed} failed of ${recipients.length}`)
  return Response.json({ week, total: recipients.length, sent, failed })
}
