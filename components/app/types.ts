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

export const TRIAL_DAYS = 14
export const PLAN_PRICE = '$199 MXN'
export const PLAN_PERIOD = '/ mes'

/** Precio y detalles del plan mensual mostrados en el paywall. */
export const PLAN = {
  name: 'Plan PpGrillo Mensual',
  price: PLAN_PRICE,
  period: PLAN_PERIOD,
  features: [
    'Razonamiento socrático ilimitado',
    'Foto de ejercicios y explicación paso a paso',
    'Historial de sesiones y seguimiento',
    'Soporte por WhatsApp',
  ] as string[],
}

/** Número de WhatsApp de soporte (mismo del widget del landing). */
export const SUPPORT_WHATSAPP_URL =
  'https://wa.me/526141202790?text=' +
  encodeURIComponent('Hola, necesito ayuda con mi suscripción a PpGrillo.')

/** Enlace de checkout de Mercado Pago (configurable vía variable de entorno). */
export const MERCADOPAGO_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL || 'https://www.mercadopago.com.mx/'

const DAY_MS = 86_400_000

/** Días restantes del periodo de prueba a partir de la fecha de inicio (timestamp ms). */
export function daysRemaining(trialStartDate: number): number {
  const elapsed = Math.floor((Date.now() - trialStartDate) / DAY_MS)
  return Math.max(0, TRIAL_DAYS - elapsed)
}
