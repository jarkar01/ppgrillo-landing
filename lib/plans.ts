export const FREE_LIFETIME_TASKS = 3

// ~5 tareas por semana del ciclo escolar. Mantiene el costo operativo (WhatsApp + IA)
// por debajo de $20 MXN por alumno al mes.
export const STANDARD_MONTHLY_TASKS = 20

// Mensajes dentro de esta ventana desde el inicio de una tarea cuentan como la misma tarea.
export const TASK_WINDOW_MINUTES = 120

export const STANDARD_PRICE_MXN = 49
export const FAMILY_PRICE_MXN = 149

const WHATSAPP_BASE = 'https://wa.me/5215649712244'

const familyFallbackUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(
  'Hola PpGrillo, quiero contratar el Plan Familiar de $149 MXN al mes',
)}`

export const MERCADOPAGO_STANDARD_URL =
  process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL || 'https://mpago.la/22zK26j'

export const MERCADOPAGO_FAMILY_URL =
  process.env.NEXT_PUBLIC_MERCADOPAGO_FAMILY_CHECKOUT_URL || familyFallbackUrl

export type PaidPlanId = 'standard' | 'family'
export type PlanId = 'free' | PaidPlanId

export const WELCOME_MESSAGE = [
  '¡Hola! Soy PpGrillo, tu tutor socrático en WhatsApp.',
  `Tienes *${FREE_LIFETIME_TASKS} tareas de cortesía de por vida*, sin tarjeta.`,
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
    'Consultas ilimitadas y multi-hijo en esta misma línea, con reporte semanal para papás.',
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
    `Ya usaste tus ${FREE_LIFETIME_TASKS} tareas de cortesía. ¡Qué gusto haber aprendido contigo!`,
    'Para seguir con PpGrillo elige un plan (pago seguro con Mercado Pago):',
    plansBreakdown(),
    'En cuanto se confirme tu pago, tu acceso se activa en esta misma conversación.',
  ].join('\n\n')
}

export function standardLimitPaywall() {
  return [
    `Llegaste a las ${STANDARD_MONTHLY_TASKS} tareas de tu Plan Estándar este mes. Se renuevan el día 1.`,
    `Si necesitas más, el Plan Familiar ($${FAMILY_PRICE_MXN} MXN/mes) incluye tareas ilimitadas y varios hermanos:`,
    MERCADOPAGO_FAMILY_URL,
  ].join('\n\n')
}
