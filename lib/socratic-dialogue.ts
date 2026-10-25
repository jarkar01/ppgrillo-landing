import type { ChatMessage } from '@/components/campaign/campaign-landing'

export const PARENT_SOCRATIC_DIALOGUE: ChatMessage[] = [
  { from: 'student', text: 'Ayúdame con este, porfa', withPhoto: true },
  { from: 'tutor', text: '¡Vamos paso a paso! ¿Cuál crees que es el primer paso antes de sumar las fracciones?' },
  { from: 'student', text: '¿Buscar el mínimo común múltiplo?' },
  { from: 'tutor', text: '¡Exacto! 👏 ¿Cuál sería entre 4 y 6?' },
  { from: 'student', text: '¡12!' },
  { from: 'tutor', text: '¡Muy bien! Ahora convirtamos la primera fracción...' },
]
