import type { UIMessage } from 'ai'

export type TutorMetadata = {
  tasksUsed: number
  limitReached: boolean
  currentTask?: string
  lastActivityAt?: number
}

export type TutorStudentState = {
  name: string
  tasksUsed: number
  currentTask?: string
  lastActivityAt?: number
  exhausted?: boolean
}

/** The tutor appends this marker when the student finishes an exercise; the UI hides it. */
export const TASK_COMPLETE_MARKER = '[[TAREA_COMPLETADA]]'

export function stripTaskMarker(text: string): string {
  const cleaned = text.split(TASK_COMPLETE_MARKER).join('')
  const start = cleaned.lastIndexOf('[[')
  if (start !== -1 && TASK_COMPLETE_MARKER.startsWith(cleaned.slice(start))) return cleaned.slice(0, start).trimEnd()
  return cleaned.trimEnd()
}

export type TutorMessage = UIMessage<TutorMetadata>
