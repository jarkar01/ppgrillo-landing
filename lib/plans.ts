export const FREE_LIFETIME_TASKS = 3

// ~5 tareas por semana del ciclo escolar. Mantiene el costo operativo (WhatsApp + IA)
// por debajo de $20 MXN por alumno al mes.
export const STANDARD_MONTHLY_TASKS = 20

// 1 tarea = 1 ejercicio completo, con todo su diálogo socrático. Si el ejercicio en curso
// queda inactivo más de este tiempo, el siguiente mensaje académico cuenta como tarea nueva.
export const TASK_IDLE_RESET_HOURS = 24

export const STANDARD_PRICE_MXN = 49
export const FAMILY_PRICE_MXN = 149

export const FAMILY_MAX_USERS = 3

export const MERCADOPAGO_STANDARD_URL = 'https://mpago.la/22zK26j'
export const MERCADOPAGO_FAMILY_URL = 'https://mpago.la/1H2S9ET'

export type PaidPlanId = 'standard' | 'family'
export type PlanId = 'free' | PaidPlanId

export const WELCOME_MESSAGE = [
  '¡Hola! Soy PpGrillo, tu tutor socrático en WhatsApp.',
  `Tienes *${FREE_LIFETIME_TASKS} tareas de cortesía de por vida*, sin tarjeta. Cada tarea es un ejercicio completo, con todos los mensajes que necesitemos para resolverlo.`,
  'Envíame la duda de tu tarea y la resolvemos paso a paso, pensando juntos.',
].join('\n\n')

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
