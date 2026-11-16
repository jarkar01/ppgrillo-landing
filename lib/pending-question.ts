const KEY = 'ppgrillo:pending-question'

/** Carries the question typed on the landing page into the first message of /app. */
export function savePendingQuestion(text: string) {
  try {
    sessionStorage.setItem(KEY, text.slice(0, 2000))
  } catch {}
}

export function takePendingQuestion(): string | null {
  try {
    const text = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return text?.trim() || null
  } catch {
    return null
  }
}
