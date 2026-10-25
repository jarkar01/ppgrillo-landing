import type { ReportRecipient } from '@/lib/whatsapp-users'

function studentLabel(r: ReportRecipient) {
  return r.studentName ?? 'tu hijo(a)'
}

export function buildParentReportText(r: ReportRecipient): string {
  const name = studentLabel(r)

  if (r.weekTasks === 0) {
    return [
      `*Reporte semanal PpGrillo* · ${name}`,
      'Esta semana no hubo tareas con PpGrillo.',
      'Cuando tenga una duda, solo tiene que enviar una foto o nota de voz de su cuaderno a este WhatsApp. Aquí estamos, con paciencia infinita.',
    ].join('\n\n')
  }

  const lines = [
    `*Reporte semanal PpGrillo* · ${name}`,
    `Esta semana trabajó *${r.weekTasks} ${r.weekTasks === 1 ? 'tarea' : 'tareas'}* razonando paso a paso con el método socrático.`,
  ]

  if (r.weekTopics.length > 0) {
    lines.push(['*Temas que practicó:*', ...r.weekTopics.map((t) => `• ${t}`)].join('\n'))
  }

  lines.push(
    r.weekTopics[0]
      ? `*Tip para conversar en familia:* pídele que te explique cómo resolvió "${r.weekTopics[0]}". Explicarlo con sus palabras consolida lo que aprendió.`
      : '*Tip para conversar en familia:* pídele que te enseñe lo que aprendió esta semana. Explicarlo con sus palabras consolida el aprendizaje.',
  )

  return lines.join('\n\n')
}

/** Body parameters for an approved template: {{1}} nombre, {{2}} número de tareas, {{3}} temas. */
export function buildParentReportTemplateParams(r: ReportRecipient): string[] {
  return [
    studentLabel(r),
    String(r.weekTasks),
    r.weekTopics.length > 0 ? r.weekTopics.join(' · ') : 'Sin tareas esta semana',
  ]
}
