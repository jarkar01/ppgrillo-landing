import type { GoogleAuth } from 'google-auth-library'

const TRIAL_DAYS = 14
const USERS_COLLECTION = 'users'

type FirestoreValue = { stringValue: string } | { timestampValue: string }

export function phoneDocId(rawPhone: string): string {
  return rawPhone.replace(/\D/g, '')
}

function resolveProjectId(auth: GoogleAuth): Promise<string | null> {
  return auth
    .getProjectId()
    .catch(() => process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null)
}

/**
 * Registers a WhatsApp sender in Firestore `users/{digits}`.
 * The first contact creates the trial; later contacts only touch `last_message_at`,
 * so the trial dates are never reset.
 */
export async function upsertWhatsAppUser(
  auth: GoogleAuth,
  rawPhone: string,
  firstMessageAt: Date,
): Promise<void> {
  const docId = phoneDocId(rawPhone)
  if (!docId) return

  const projectId = await resolveProjectId(auth)
  if (!projectId) {
    console.error('[whatsapp] Firestore project id could not be resolved')
    return
  }

  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await auth.getAccessToken()}`,
  }

  const now = new Date().toISOString()
  const startedAt = firstMessageAt.toISOString()
  const trialEnd = new Date(firstMessageAt.getTime() + TRIAL_DAYS * 86_400_000).toISOString()

  const fields: Record<string, FirestoreValue> = {
    phone: { stringValue: `+${docId}` },
    created_at: { timestampValue: startedAt },
    trial_start_date: { timestampValue: startedAt },
    trial_end_date: { timestampValue: trialEnd },
    status: { stringValue: 'active_trial' },
    source: { stringValue: 'whatsapp' },
    last_message_at: { timestampValue: now },
  }

  // `documentId` makes this a create-only write: it fails with 409 if the user already exists.
  const createRes = await fetch(
    `${base}/${USERS_COLLECTION}?documentId=${encodeURIComponent(docId)}`,
    { method: 'POST', headers, body: JSON.stringify({ fields }) },
  )

  if (createRes.ok) {
    console.log(`[whatsapp] Registered new user ${docId} (trial until ${trialEnd})`)
    return
  }

  if (createRes.status !== 409) {
    console.error(
      `[whatsapp] Firestore user create failed - status: ${createRes.status} - body: ${await createRes.text()}`,
    )
    return
  }

  const updateRes = await fetch(
    `${base}/${USERS_COLLECTION}/${encodeURIComponent(docId)}?updateMask.fieldPaths=last_message_at`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields: { last_message_at: { timestampValue: now } } }),
    },
  )

  if (!updateRes.ok) {
    console.error(
      `[whatsapp] Firestore user update failed - status: ${updateRes.status} - body: ${await updateRes.text()}`,
    )
  }
}
