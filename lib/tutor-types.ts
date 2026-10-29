import type { UIMessage } from 'ai'

export type TutorMetadata = {
  tasksUsed: number
  limitReached: boolean
}

export type TutorMessage = UIMessage<TutorMetadata>
