import { BookOpen, Clock, HeartHandshake, Lightbulb, MoonStar, Trophy } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SignupModalProvider } from '@/components/estudiantes/signup-modal'
import { StudentHero } from '@/components/estudiantes/student-hero'
import { BenefitGrid, type Benefit } from '@/components/estudiantes/benefit-grid'
import { FreeTime } from '@/components/estudiantes/free-time'
import { StudentPricing } from '@/components/estudiantes/student-pricing'

const emotionalBenefits: Benefit[] = [
  {
    icon: HeartHandshake,
    title: 'Cero juicios',
    body: 'Pregunta lo mismo todas las veces que haga falta; Pp Grillo no pierde la paciencia.',
    color: '#4285F4',
  },
  {
    icon: MoonStar,
    title: 'Adiós al bloqueo de noche',
    body: 'Se acabó pasar horas mirando la libreta en blanco sin saber qué hacer.',
    color: '#EA4335',
  },
  {
    icon: Trophy,
    title: 'Seguridad en ti mismo',
    body: 'La satisfacción real de descubrir que sí podías resolverlo por tu propia cuenta.',
    color: '#34A853',
  },
]

const schoolBenefits: Benefit[] = [
  {
    icon: Lightbulb,
    title: 'Pistas, no respuestas regaladas',
    body: 'Te enseña a deducir el camino para que cuando llegue el examen lo apruebes solo.',
    color: '#FBBC05',
  },
  {
    icon: BookOpen,
    title: 'Todas tus materias en un solo tutor',
    body: 'Matemáticas, física, química, historia, biología y más.',
    color: '#4285F4',
  },
  {
    icon: Clock,
    title: 'Explicaciones en 2 minutos',
    body: 'Sin necesidad de tragarte tutoriales de 40 minutos en YouTube.',
    color: '#34A853',
  },
]

export default function EstudiantesPage() {
  return (
    <SignupModalProvider>
      <div className="min-h-screen overflow-x-hidden bg-background">
        <SiteHeader />
        <main>
          <StudentHero />
          <BenefitGrid
            eyebrow="Cero estrés"
            title="Estudia a tu ritmo y sin pasar penas"
            benefits={emotionalBenefits}
            tinted
          />
          <BenefitGrid
            id="pedagogia"
            eyebrow="Entiende de verdad"
            title="Entiende el truco detrás de cada problema"
            benefits={schoolBenefits}
          />
          <FreeTime />
          <StudentPricing />
        </main>
        <SiteFooter />
      </div>
    </SignupModalProvider>
  )
}
