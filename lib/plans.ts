export const FREE_LIFETIME_TASKS = 3

// ~5 tareas por semana del ciclo escolar. Mantiene el costo operativo (WhatsApp + IA)
// por debajo de $20 MXN por alumno al mes.
export const STANDARD_MONTHLY_TASKS = 20

// 1 tarea = 1 ejercicio completo, con todo su diálogo socrático. Si el ejercicio en curso
// queda inactivo más de este tiempo, el siguiente mensaje académico cuenta como tarea nueva.
export const TASK_IDLE_RESET_HOURS = 24

export const STANDARD_PRICE_MXN = 39
export const FAMILY_PRICE_MXN = 149

export const FAMILY_MAX_USERS = 3

export const MERCADOPAGO_STANDARD_URL = 'https://mpago.la/22zK26j'
export const MERCADOPAGO_FAMILY_URL = 'https://mpago.la/1H2S9ET'

export type PaidPlanId = 'standard' | 'family'
export type PlanId = 'free' | PaidPlanId

export const WELCOME_MESSAGE = [
  '¡Hola! Soy PpGrillo, tu tutor socrático en WhatsApp.',
  `Tienes *${FREE_LIFETIME_TASKS} tareas gratuitas de prueba* (${FREE_LIFETIME_TASKS} ejercicios), sin tarjeta. Cada tarea es un ejercicio completo, con todos los mensajes que necesitemos para resolverlo paso a paso.`,
  'Para empezar, cuéntame: *¿cómo te llamas y en qué grado vas?* (por ejemplo: "Soy Ana y voy en 5º de primaria").',
  'Después, envíame tu primera tarea o problema escolar y lo resolvemos juntos.',
].join('\n\n')

export const TRIAL_REPLY_FALLBACK = `Recuerda: tienes ${FREE_LIFETIME_TASKS} tareas gratuitas de prueba (${FREE_LIFETIME_TASKS} ejercicios), sin tarjeta. Envíame tu tarea o problema escolar y lo resolvemos paso a paso. Escribe "planes" para ver los planes de pago.`

const DAY_BASED_TRIAL = /\b(14|catorce)\s*d[ií]as\b|prueba\s+de\s+\d+\s*d[ií]as/i

// The Dialogflow agent may still carry legacy copy; the bot never promises a day-based trial.
export function enforceTrialCopy(reply: string): string {
  return DAY_BASED_TRIAL.test(reply) ? TRIAL_REPLY_FALLBACK : reply
}

export function profileSavedMessage(profile: { name?: string; grade?: string }) {
  const greeting = profile.name ? `¡Mucho gusto, ${profile.name}!` : '¡Perfecto!'
  if (!profile.grade) {
    return `${greeting} ¿En qué grado vas? Así adapto las explicaciones a tu nivel.`
  }
  if (!profile.name) {
    return `${greeting} Ya anoté que vas en ${profile.grade}. ¿Cómo te llamas?`
  }
  return `${greeting} Ya anoté que vas en ${profile.grade}. Envíame el ejercicio de tu tarea y lo resolvemos paso a paso, pensando juntos.`
}

export const LAST_FREE_TASK_NOTICE =
  'Dato importante: esta es tu última tarea de cortesía. Para seguir aprendiendo después, escribe "planes".'

function plansBreakdown() {
  return [
    `*Plan Estándar — $${STANDARD_PRICE_MXN} MXN/mes*`,
    `Tareas semanales del ciclo escolar (hasta ${STANDARD_MONTHLY_TASKS} al mes) + reporte semanal de avance para papás en WhatsApp.`,
    MERCADOPAGO_STANDARD_URL,
    '',
    `*Plan Familiar / Ilimitado — $${FAMILY_PRICE_MXN} MXN/mes*`,
    `Consultas ilimitadas para hasta ${FAMILY_MAX_USERS} usuarios en esta misma línea, con reporte semanal para papás.`,
    MERCADOPAGO_FAMILY_URL,
  ].join('\n')
}

export function plansMessage() {
  return [
    'Estos son los planes de PpGrillo (pago seguro con Mercado Pago):',
    plansBreakdown(),
  ].join('\n\n')
}

export function freeExhaustedPaywall() {
  return [
    `Ya completaste tus ${FREE_LIFETIME_TASKS} tareas gratuitas (${FREE_LIFETIME_TASKS} ejercicios). ¡Qué gusto haber aprendido contigo!`,
    'Para resolver este nuevo ejercicio y seguir aprendiendo, elige tu plan (pago seguro con Mercado Pago):',
    [
      `- Plan Estándar ($${STANDARD_PRICE_MXN} MXN/mes): ${MERCADOPAGO_STANDARD_URL}`,
      `- Plan Familiar ($${FAMILY_PRICE_MXN} MXN/mes): ${MERCADOPAGO_FAMILY_URL}`,
    ].join('\n'),
    'En cuanto se confirme tu pago, tu acceso se activa en esta misma conversación.',
  ].join('\n\n')
}

export function standardLimitPaywall() {
  return [
    `Llegaste a las ${STANDARD_MONTHLY_TASKS} tareas de tu Plan Estándar este mes. Se renuevan el día 1.`,
    `Si necesitas más, el Plan Familiar ($${FAMILY_PRICE_MXN} MXN/mes) incluye tareas ilimitadas para hasta ${FAMILY_MAX_USERS} usuarios:`,
    MERCADOPAGO_FAMILY_URL,
  ].join('\n\n')
}
