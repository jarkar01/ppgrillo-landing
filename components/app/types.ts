import type { UIMessage } from 'ai'

export type StudentProfile = {
  studentName: string
  grade: 'Primaria' | 'Secundaria' | 'Preparatoria'
  whatsapp: string
}

export type TutorSession = {
  id: string
  title: string
  messages: UIMessage[]
}
