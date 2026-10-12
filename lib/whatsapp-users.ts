import type { GoogleAuth } from 'google-auth-library'

const TRIAL_DAYS = 14
const USERS_COLLECTION = 'users'
const NATIONAL_DIGITS = 10

type FirestoreValue =
  | { stringValue: string }
  | { timestampValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { mapValue: unknown }
  | { arrayValue: unknown }

type FirestoreDocument = { fields?: Record<string, FirestoreValue> }

export type UserProfile = {
  phone: string
  name?: string
  grade?: string
  country: string
  educationSystem: string
}

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

function readString(fields: Record<string, FirestoreValue>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = fields[key]
    if (!value) continue
    if ('stringValue' in value && value.stringValue.trim()) return value.stringValue.trim()
    if ('integerValue' in value) return value.integerValue
  }
  return undefined
}

function buildProfile(
  docId: string,
  rawPhone: string,
  fields: Record<string, FirestoreValue>,
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
  }
}

function resolveProjectId(auth: GoogleAuth): Promise<string | null> {
  return auth
    .getProjectId()
    .catch(() => process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null)
}

/**
 * Finds `users/{10 digits}` and returns the profile. Existing users only get `last_message_date`
 * touched, so name, grade, country and trial dates are never overwritten. New senders get a
 * 14-day trial document.
 */
export async function upsertWhatsAppUser(
  auth: GoogleAuth,
  rawPhone: string,
  firstMessageAt: Date,
): Promise<UserProfile | null> {
  const docId = normalizePhone(rawPhone)
  if (!docId) return null

  const projectId = await resolveProjectId(auth)
  if (!projectId) {
    console.error('[whatsapp] Firestore project id could not be resolved')
    return null
  }

  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${USERS_COLLECTION}`
  const docUrl = `${base}/${encodeURIComponent(docId)}`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await auth.getAccessToken()}`,
  }
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
    return buildProfile(docId, rawPhone, existing.fields ?? {})
  }

  if (existingRes.status !== 404) {
    console.error(
      `[whatsapp] Firestore user lookup failed - status: ${existingRes.status} - body: ${await existingRes.text()}`,
    )
    return buildProfile(docId, rawPhone, {})
  }

  const startedAt = firstMessageAt.toISOString()
  const trialEnd = new Date(firstMessageAt.getTime() + TRIAL_DAYS * 86_400_000).toISOString()
  const country = countryFromPhone(rawPhone)

  const fields: Record<string, FirestoreValue> = {
    phone: { stringValue: docId },
    whatsapp_id: { stringValue: rawPhone.replace(/\D/g, '') },
    created_at: { timestampValue: startedAt },
    trial_start_date: { timestampValue: startedAt },
    trial_end_date: { timestampValue: trialEnd },
    status: { stringValue: 'active_trial' },
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
    console.log(`[whatsapp] Registered new user ${docId} (trial until ${trialEnd})`)
  } else if (createRes.status !== 409) {
    console.error(
      `[whatsapp] Firestore user create failed - status: ${createRes.status} - body: ${await createRes.text()}`,
    )
  }

  return buildProfile(docId, rawPhone, fields)
}
