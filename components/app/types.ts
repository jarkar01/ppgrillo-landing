import type { UIMessage } from 'ai'

export type StudentProfile = {
  studentName: string
  grade?: 'Primaria' | 'Secundaria' | 'Preparatoria'
  whatsapp: string
  /** Inicio de la prueba (ms), persistido en Firestore. */
  trialStartDate?: number
  plan?: PlanTier
  /** Mensajes enviados en `lastMessageDate` (día local, YYYY-MM-DD). */
  messagesToday?: number
  lastMessageDate?: string
}

export type PlanTier = 'prueba' | 'basico' | 'ilimitado'

/**
 * Límites de uso por plan. `dailyMessageLimit: null` significa sin límite.
 * Ajusta aquí los valores cuando se activen los planes de cobro.
 */
export const PLAN_TIERS: Record<PlanTier, { label: string; dailyMessageLimit: number | null }> = {
  prueba: { label: 'Prueba gratuita', dailyMessageLimit: 25 },
  basico: { label: 'Plan Básico', dailyMessageLimit: 50 },
  ilimitado: { label: 'Plan Ilimitado / Intenso', dailyMessageLimit: null },
}

/** Fecha local del dispositivo en formato YYYY-MM-DD; el conteo se reinicia al cambiar de día. */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export type TutorSession = {
  id: string
  title: string
  messages: UIMessage[]
}

export const TRIAL_DAYS = 14
export const PLAN_PRICE = '$25 MXN'
export const PLAN_PERIOD = '/ mes'
/** Leyenda de accesibilidad mostrada junto al precio. */
export const PLAN_TAGLINE =
  'Educación accesible para todos (menos de lo que cuesta un refresco o café).'

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
  process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL || 'https://mpago.la/22zK26j'

const DAY_MS = 86_400_000

/** Días restantes del periodo de prueba a partir de la fecha de inicio (timestamp ms). */
export function daysRemaining(trialStartDate: number): number {
  const elapsed = Math.floor((Date.now() - trialStartDate) / DAY_MS)
  return Math.max(0, TRIAL_DAYS - elapsed)
}
