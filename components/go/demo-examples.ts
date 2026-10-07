export type DemoExample = {
  id: string
  emoji: string
  topic: string
  question: string
  intro?: string
  reply: string
}

export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'fracciones',
    emoji: '🍕',
    topic: 'Fracciones',
    question: '¿Por qué 1/2 es más grande que 1/4 si el 4 es mayor?',
    reply:
      '¡Qué buena pregunta! Imagina una pizza solo para ti. Si la partes en 2 pedazos iguales, cada uno es 1/2. Ahora imagina esa misma pizza partida en 4 pedazos. Si la pizza es del mismo tamaño pero la repartes en más pedazos, ¿cada pedazo se hace más grande o más pequeño?',
  },
  {
    id: 'division',
    emoji: '➗',
    topic: 'División de casita',
    question: '¿Cómo le explico la división paso a paso sin regañarlo?',
    intro: 'Así acompañaría PpGrillo a tu hijo con 84 ÷ 4:',
    reply:
      'Imagina que tienes 84 canicas y quieres repartirlas entre 4 amigos para que a todos les toque igual. Empecemos por las decenas: tienes 8 bolsitas con 10 canicas cada una. Si repartes esas 8 bolsitas entre 4 amigos, ¿cuántas bolsitas le tocan a cada uno?',
  },
  {
    id: 'lectura',
    emoji: '📖',
    topic: 'Comprensión lectora',
    question: '¿Cómo ayudarlo a resumir una lección si no sabe por dónde empezar?',
    intro: 'Así guiaría PpGrillo a tu hijo:',
    reply:
      'Imagina que tu mejor amigo faltó hoy a la escuela y te pregunta de qué trató la lección. No le contarías todo, solo lo más importante. Mira otra vez el título: con tus propias palabras y en una sola frase, ¿de qué crees que trata?',
  },
]
