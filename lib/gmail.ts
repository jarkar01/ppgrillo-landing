import nodemailer, { type Transporter } from 'nodemailer'

export type OutgoingEmail = { subject: string; text: string; html: string }

export type EmailSendResult = { ok: true } | { ok: false; reason: string }

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null
  transporter ??= nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass: pass.replace(/\s+/g, '') },
  })
  return transporter
}

export function isGmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
}

/** Sends through Gmail SMTP using an App Password of the GMAIL_USER account. */
export async function sendGmail(to: string, email: OutgoingEmail): Promise<EmailSendResult> {
  const transport = getTransporter()
  if (!transport) return { ok: false, reason: 'email_sender_not_configured' }
  try {
    await transport.sendMail({
      from: { name: 'PpGrillo', address: process.env.GMAIL_USER as string },
      to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    })
    return { ok: true }
  } catch (error) {
    console.error('[gmail] Send failed:', error)
    return { ok: false, reason: 'send_failed' }
  }
}
