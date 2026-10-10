import { Pricing } from '@/components/pricing'

const benefits = [
  'Tutor socrático 24/7 con paciencia infinita',
  'Lectura de fotos y audios de la libreta',
  'Reportes semanales para padres bajo demanda',
  'Campamento de verano y vacaciones incluido (refuerzo continuo sin costo extra)',
  'Pagos vía Mercado Pago o Stripe',
]

export function HomePricing() {
  return (
    <Pricing
      title="Un precio simple para devolverle la tranquilidad a tu hogar."
      benefits={benefits}
    />
  )
}
