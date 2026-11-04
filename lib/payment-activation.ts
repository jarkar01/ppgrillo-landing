import { sendGmail, type OutgoingEmail } from '@/lib/gmail'
import type { MercadoPagoPayment } from '@/lib/mercadopago'
import {
  firestoreContext,
  getParentRecord,
  patchDocument,
  toParentEmail,
  updateParentRecord,
  type FirestoreFields,
  type ParentRecord,
} from '@/lib/parent-users'

const PAYMENTS = 'mp_payments'
const REQUEST_TIMEOUT_MS = 10_000

type Doc = { id: string; fields: FirestoreFields }

export type ActivationResult =
  | { status: 'activated' | 'already_processed'; email?: string }
  | { status: 'not_approved' | 'unmatched' }
  | { status: 'error'; reason: string }

function str(fields: FirestoreFields, key: string): string | undefined {
  const value = fields[key]
  return value && 'stringValue' in value && value.stringValue ? value.stringValue : undefined
}

async function getDocument(path: string): Promise<Doc | null | 'error'> {
  const ctx = await firestoreContext()
  if (!ctx) return 'error'
  const res = await fetch(`${ctx.base}/${path}`, {
    headers: ctx.headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    console.error('[payments] Read failed:', path, res.status, await res.text())
    return 'error'
  }
  const doc = (await res.json()) as { fields?: FirestoreFields }
  return { id: path.split('/').pop() ?? '', fields: doc.fields ?? {} }
}

/** external_reference carries the parent email typed at checkout; the payer email is the fallback. */
function candidateEmails(payment: MercadoPagoPayment): string[] {
  const emails = [payment.external_reference, payment.payer?.email]
    .map(toParentEmail)
    .filter((e): e is string => Boolean(e))
  return [...new Set(emails)]
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setUTCMonth(next.getUTCMonth() + months)
  return next
}

function buildActivationEmail(params: {
  studentName?: string
  plan: string
  period: string
  expiresAt: Date
}): OutgoingEmail {
  const planName = params.plan === 'family' ? 'Plan Familiar' : 'Plan Estándar'
  const periodName = params.period === 'quarterly' ? 'trimestral' : 'mensual'
  const until = params.expiresAt.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  })
  const student = params.studentName ? ` para ${params.studentName}` : ''
  const paragraphs = [
    `¡Gracias! Tu pago se confirmó y el ${planName} (${periodName})${student} ya está activo.`,
    `Vigencia: hasta el ${until}.`,
    'Cada semana recibirás en este correo el reporte de avance con las tareas trabajadas y un tip para conversar en familia.',
    'Para estudiar, abre PpGrillo en https://ppgrillo.io/app.',
  ]
  return {
    subject: `Tu ${planName} de PpGrillo está activo`,
    text: paragraphs.join('\n\n'),
    html: paragraphs.map((p) => `<p>${p.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)}</p>`).join(''),
  }
}

/**
 * Activates the parent record in `users` for an approved Mercado Pago payment and sends the
 * confirmation email. Idempotent per payment id via the `mp_payments` collection.
 */
export async function activateFromPayment(payment: MercadoPagoPayment): Promise<ActivationResult> {
  const paymentPath = `${PAYMENTS}/${payment.id}`
  const nowIso = new Date().toISOString()

  const existing = await getDocument(paymentPath)
  if (existing === 'error') return { status: 'error', reason: 'firestore_unavailable' }
  if (existing && str(existing.fields, 'processing_status') === 'activated') {
    return { status: 'already_processed', email: str(existing.fields, 'parent_email') }
  }

  const paymentFields: FirestoreFields = {
    payment_id: { stringValue: String(payment.id) },
    mp_status: { stringValue: payment.status },
    mp_status_detail: payment.status_detail ? { stringValue: payment.status_detail } : { nullValue: null },
    amount: { doubleValue: payment.transaction_amount ?? 0 },
    currency: { stringValue: payment.currency_id ?? 'MXN' },
    payer_email: payment.payer?.email ? { stringValue: payment.payer.email.toLowerCase() } : { nullValue: null },
    updated_at: { timestampValue: nowIso },
  }

  if (payment.status !== 'approved') {
    const ok = await patchDocument(paymentPath, {
      ...paymentFields,
      processing_status: { stringValue: 'not_approved' },
    })
    return ok ? { status: 'not_approved' } : { status: 'error', reason: 'firestore_write_failed' }
  }

  // The family document is `users/{email}`; a payment without a prior checkout creates it.
  const emails = candidateEmails(payment)
  let user: ParentRecord | null = null
  for (const email of emails) {
    const found = await getParentRecord(email)
    if (found === 'error') return { status: 'error', reason: 'firestore_unavailable' }
    if (found) {
      user = found
      break
    }
  }
  if (!user && emails[0]) user = { email: emails[0], fields: {} }

  if (!user) {
    console.warn('[payments] Approved payment without a usable parent email:', payment.id)
    const ok = await patchDocument(paymentPath, {
      ...paymentFields,
      processing_status: { stringValue: 'unmatched' },
    })
    return ok ? { status: 'unmatched' } : { status: 'error', reason: 'firestore_write_failed' }
  }

  // `checkout_plan`/`checkout_period`/`email` cover parent records saved before the field rename.
  const plan = str(user.fields, 'plan') ?? str(user.fields, 'checkout_plan') ?? 'standard'
  const period = str(user.fields, 'period') ?? str(user.fields, 'checkout_period') ?? 'monthly'
  const approvedAt = payment.date_approved ? new Date(payment.date_approved) : new Date()
  const expiresAt = addMonths(approvedAt, period === 'quarterly' ? 3 : 1)

  const activated = await updateParentRecord(user.email, {
    report_channel: { stringValue: 'email' },
    plan_status: { stringValue: 'active' },
    plan: { stringValue: plan },
    period: { stringValue: period },
    paid_plan: { stringValue: plan },
    paid_period: { stringValue: period },
    plan_activated_at: { timestampValue: approvedAt.toISOString() },
    plan_expires_at: { timestampValue: expiresAt.toISOString() },
    last_payment_id: { stringValue: String(payment.id) },
    last_payment_amount: { doubleValue: payment.transaction_amount ?? 0 },
    updated_at: { timestampValue: nowIso },
  })
  if (!activated) return { status: 'error', reason: 'firestore_write_failed' }

  const email = user.email
  const emailAlreadySent = existing ? 'timestampValue' in (existing.fields.activation_email_sent_at ?? {}) : false
  const sent =
    email && !emailAlreadySent
      ? await sendGmail(
          email,
          buildActivationEmail({ studentName: str(user.fields, 'student_name'), plan, period, expiresAt }),
        )
      : { ok: emailAlreadySent }

  await patchDocument(paymentPath, {
    ...paymentFields,
    parent_email: { stringValue: user.email },
    plan: { stringValue: plan },
    period: { stringValue: period },
    processing_status: { stringValue: 'activated' },
    ...(sent.ok && !emailAlreadySent ? { activation_email_sent_at: { timestampValue: nowIso } } : {}),
  })

  if (!sent.ok) console.error('[payments] Activation email not sent for payment', payment.id)
  return { status: 'activated', email: user.email }
}
