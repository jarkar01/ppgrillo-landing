import { BookOpen, Clock, HeartHandshake, Lightbulb, MoonStar, Trophy } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { StudentHero } from '@/components/estudiantes/student-hero'
import { HowToAsk } from '@/components/estudiantes/how-to-ask'
import { BenefitGrid, type Benefit } from '@/components/estudiantes/benefit-grid'
import { FreeTime } from '@/components/estudiantes/free-time'
import { StudentPricing } from '@/components/estudiantes/student-pricing'
import { InlineTrialCta } from '@/components/home/inline-trial-cta'
import { MobileStickyCta } from '@/components/home/mobile-sticky-cta'

const emotionalBenefits: Benefit[] = [
  {
    icon: HeartHandshake,
    title: 'Cero juicios',
    body: 'Pregunta mil veces; Pp Grillo nunca pierde la paciencia.',
    color: '#4285F4',
  },
  {
    icon: MoonStar,
    title: 'Adiós al bloqueo de noche',
    body: 'Nada de horas mirando la libreta en blanco.',
    color: '#EA4335',
  },
  {
    icon: Trophy,
    title: 'Seguridad en ti mismo',
    body: 'Descubre que sí podías resolverlo por tu cuenta.',
    color: '#34A853',
  },
]

const schoolBenefits: Benefit[] = [
  {
    icon: Lightbulb,
    title: 'Pistas, no respuestas regaladas',
    body: 'Aprendes el camino y en el examen lo resuelves solo.',
    color: '#FBBC05',
  },
  {
    icon: BookOpen,
    title: 'Todas tus materias en un solo tutor',
    body: 'Mate, física, química, historia, biología y más.',
    color: '#4285F4',
  },
  {
    icon: Clock,
    title: 'Explicaciones en 2 minutos',
    body: 'Sin tutoriales eternos de 40 minutos en YouTube.',
    color: '#34A853',
  },
]

export default function EstudiantesPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-28 md:pb-0">
      <SiteHeader />
      <main>
        <StudentHero />
        <div id="saber-mas" className="scroll-mt-20">
          <BenefitGrid
            id="beneficios"
            eyebrow="Apoyo sin juicio"
            title="Estudia a tu ritmo y sin pasar penas"
            benefits={emotionalBenefits}
            tinted
            compactMobile
          />
          <BenefitGrid
            id="pedagogia"
            eyebrow="Materias cubiertas"
            title="Entiende el truco detrás de cada problema"
            benefits={schoolBenefits}
            compactMobile
          />
          <HowToAsk />
          <div className="pb-16">
            <InlineTrialCta label="Terminar mi tarea de hoy gratis" />
          </div>
        </div>
        <FreeTime />
        <StudentPricing />
      </main>
      <SiteFooter />
      <MobileStickyCta legend="Sin contraseñas • Sin tarjetas bancarias" />
    </div>
  )
}
