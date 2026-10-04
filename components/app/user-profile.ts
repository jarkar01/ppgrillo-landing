import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  type FirestoreError,
  type Timestamp,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { todayKey, type PlanTier, type StudentProfile } from './types'

type UserDoc = {
  uid?: string
  student_name?: string
  grade?: StudentProfile['grade']
  phone?: string
  onboarding_completed?: boolean
  trial_start_date?: Timestamp
  plan?: PlanTier
  messages_today?: number
  last_message_date?: string
  pin?: string
  source?: string
  role?: string
}

const PHONE_STORAGE_KEY = 'ppgrillo_phone'

/** Keeps only digits; a valid Mexican WhatsApp number has exactly 10. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

export function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone)
}

/**
 * Pointer to the user's Firestore document id (the phone, or the anonymous uid for /go signups);
 * the profile itself lives in Firestore. The storage key keeps its name so existing sessions survive.
 */
export function getStoredPhone(): string | null {
  try {
    return localStorage.getItem(PHONE_STORAGE_KEY)
  } catch {
    return null
  }
}

function setStoredPhone(phone: string | null) {
  try {
    if (phone) localStorage.setItem(PHONE_STORAGE_KEY, phone)
    else localStorage.removeItem(PHONE_STORAGE_KEY)
  } catch {
    // Some in-app browsers block storage in private modes; the session still works for this visit.
  }
}

export function clearStoredPhone() {
  setStoredPhone(null)
}

function toProfile(data: UserDoc, docId: string): StudentProfile {
  return {
    studentName: data.student_name ?? '',
    grade: data.grade,
    whatsapp: data.phone ?? (isValidPhone(docId) ? docId : ''),
    userDocId: docId,
    trialStartDate: data.trial_start_date?.toMillis(),
    plan: data.plan,
    messagesToday: data.messages_today ?? 0,
    lastMessageDate: data.last_message_date,
  }
}

/** Increments today's counter atomically, resetting it when the stored date is a previous day. */
export async function recordMessage(phone: string): Promise<{ date: string; count: number }> {
  const ref = doc(firestore(), 'users', phone)
  const today = todayKey()
  return runTransaction(firestore(), async (tx) => {
    const data = (await tx.get(ref)).data() as UserDoc | undefined
    const count = data?.last_message_date === today ? (data.messages_today ?? 0) + 1 : 1
    tx.update(ref, { messages_today: count, last_message_date: today })
    return { date: today, count }
  })
}

/** Returns the saved profile when this anonymous session owns the phone's document. */
export async function loadProfile(uid: string, phone: string): Promise<StudentProfile | null> {
  const snap = await getDoc(doc(firestore(), 'users', phone))
  if (!snap.exists()) return null
  const data = snap.data() as UserDoc
  if (data.uid !== uid) return null
  return toProfile(data, phone)
}

/**
 * Creates or reclaims the phone's user document for this session. A returning user on a new
 * device gets a new anonymous uid, so Firestore denies the read; we then reclaim the document,
 * and the security rules keep the original trial_start_date so the trial can't be restarted.
 */
export async function registerTrial(
  uid: string,
  studentName: string,
  phone: string,
): Promise<StudentProfile> {
  const ref = doc(firestore(), 'users', phone)

  let exists = false
  let existing: UserDoc | undefined
  try {
    const snap = await getDoc(ref)
    exists = snap.exists()
    existing = snap.data() as UserDoc | undefined
  } catch (err) {
    if ((err as FirestoreError).code !== 'permission-denied') throw err
    exists = true
  }

  await setDoc(
    ref,
    {
      uid,
      student_name: studentName,
      phone,
      onboarding_completed: true,
      updated_at: serverTimestamp(),
      ...(exists ? {} : { trial_start_date: serverTimestamp(), created_at: serverTimestamp() }),
    },
    { merge: true },
  )

  if (exists && !existing) {
    existing = (await getDoc(ref)).data() as UserDoc | undefined
  }

  setStoredPhone(phone)
  return {
    ...toProfile(existing ?? {}, phone),
    studentName,
    whatsapp: phone,
    userDocId: phone,
    trialStartDate: existing?.trial_start_date?.toMillis() ?? Date.now(),
  }
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

/**
 * Phone-less signup for the /go experiment. The document is keyed by the anonymous uid, so a
 * repeat signup on the same device keeps the original trial_start_date instead of restarting it.
 */
export async function registerZeroFrictionTrial(
  uid: string,
  details: { studentName: string; grade: NonNullable<StudentProfile['grade']>; pin: string },
): Promise<StudentProfile> {
  const ref = doc(firestore(), 'users', uid)
  const existing = (await getDoc(ref)).data() as UserDoc | undefined

  await setDoc(
    ref,
    {
      uid,
      student_name: details.studentName,
      grade: details.grade,
      pin: details.pin,
      source: 'experiment_go',
      role: 'student_trial',
      onboarding_completed: true,
      updated_at: serverTimestamp(),
      ...(existing ? {} : { trial_start_date: serverTimestamp(), created_at: serverTimestamp() }),
    },
    { merge: true },
  )

  setStoredPhone(uid)
  return {
    ...toProfile(existing ?? {}, uid),
    studentName: details.studentName,
    grade: details.grade,
    trialStartDate: existing?.trial_start_date?.toMillis() ?? Date.now(),
  }
}
