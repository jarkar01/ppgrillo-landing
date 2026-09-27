import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { firestore } from '@/lib/firebase'
import type { StudentProfile } from './types'

type UserDoc = {
  student_name?: string
  grade?: StudentProfile['grade']
  phone?: string
  onboarding_completed?: boolean
  trial_start_date?: Timestamp
}

/** Returns the saved profile if the user already finished onboarding, otherwise null. */
export async function loadCompletedProfile(uid: string): Promise<StudentProfile | null> {
  const snap = await getDoc(doc(firestore(), 'users', uid))
  if (!snap.exists()) return null

  const data = snap.data() as UserDoc
  const hasAllFields = Boolean(data.student_name && data.grade && data.phone)
  if (!data.onboarding_completed && !hasAllFields) return null

  return {
    studentName: data.student_name ?? '',
    grade: data.grade ?? 'Primaria',
    whatsapp: data.phone ?? '',
    trialStartDate: data.trial_start_date?.toMillis(),
  }
}

export async function saveOnboarding(user: User, profile: StudentProfile): Promise<StudentProfile> {
  const ref = doc(firestore(), 'users', user.uid)
  const existing = await getDoc(ref)
  const trialStart = (existing.data() as UserDoc | undefined)?.trial_start_date

  await setDoc(
    ref,
    {
      email: user.email,
      display_name: user.displayName,
      student_name: profile.studentName,
      grade: profile.grade,
      phone: profile.whatsapp,
      onboarding_completed: true,
      trial_start_date: trialStart ?? serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    { merge: true },
  )

  return { ...profile, trialStartDate: trialStart?.toMillis() ?? Date.now() }
}
