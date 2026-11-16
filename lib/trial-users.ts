import { randomUUID } from 'node:crypto'
import { getParentRecord, patchDocument, updateParentRecord, type FirestoreFields } from '@/lib/parent-users'

const ANONYMOUS_TRIALS = 'anonymous_trials'

/**
 * Saves the parent email left after the first anonymous task. Never touches the plan of an
 * existing account, so a paying family keeps its plan untouched.
 */
export async function saveTrialEmail(email: string, studentName?: string): Promise<boolean> {
  const record = await getParentRecord(email)
  if (record === 'error') return false
  const now = new Date().toISOString()
  const fields: FirestoreFields = {
    trial_email_at: { timestampValue: now },
    updated_at: { timestampValue: now },
    ...(studentName ? { student_name: { stringValue: studentName } } : {}),
    ...(record
      ? {}
      : {
          source: { stringValue: 'web_trial' },
          plan: { stringValue: 'free' },
          plan_status: { stringValue: 'free_trial' },
          report_channel: { stringValue: 'email' },
          created_at: { timestampValue: now },
        }),
  }
  return updateParentRecord(email, fields)
}

/** Lightweight event: an anonymous visitor sent the first message of free task #1. */
export async function recordAnonymousTrial(event: { hasImage: boolean; userAgent?: string | null }): Promise<void> {
  try {
    await patchDocument(`${ANONYMOUS_TRIALS}/${randomUUID()}`, {
      event: { stringValue: 'first_message' },
      task_number: { integerValue: '1' },
      has_image: { booleanValue: event.hasImage },
      device: { stringValue: /mobile|android|iphone|ipad/i.test(event.userAgent ?? '') ? 'mobile' : 'desktop' },
      created_at: { timestampValue: new Date().toISOString() },
    })
  } catch (error) {
    console.error('[trial] Anonymous trial event failed:', error)
  }
}
