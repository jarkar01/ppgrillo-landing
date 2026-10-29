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
}

export type TutorMessage = UIMessage<TutorMetadata>
