import {
  Award,
  Brain,
  CalendarCheck,
  Eye,
  HandHeart,
  HeartHandshake,
  Home,
  Presentation,
  ShieldCheck,
  Smile,
} from 'lucide-react'
import { BrandFonts } from '@/components/brand-fonts'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { SiteFooter } from '@/components/site-footer'
import { ChatWidget } from '@/components/chat-widget'
import { SignupModalProvider } from '@/components/estudiantes/signup-modal'
import { BenefitGrid, type Benefit } from '@/components/estudiantes/benefit-grid'
import { FamilySection } from '@/components/home/family-section'
import { FeaturesSection } from '@/components/home/features-section'
import { HomePricing } from '@/components/home/home-pricing'

const parentBenefits: Benefit[] = [
  {
    icon: Home,
    title: 'Cero tensión al llegar a casa',
    body: 'No vuelvas a iniciar un segundo turno laboral repasando temas que viste hace años.',
    color: '#4285F4',
  },
  {
    icon: Eye,
    title: 'Acompañamiento sin vigilancia invasiva',
    body: 'Recibe resúmenes claros de su esfuerzo y avance sin tener que revisar la libreta a la fuerza.',
    color: '#34A853',
  },
  {
    icon: ShieldCheck,
    title: 'La certeza de que no hace trampa',
    body: 'La IA no le da respuestas automáticas para copiar, sino preguntas guía que desarrollan su mente.',
    color: '#FBBC05',
  },
]

const childBenefits: Benefit[] = [
  {
    icon: HeartHandshake,
    title: 'Preguntar sin miedo ni vergüenza',
    body: 'Puede repreguntar cinco veces lo mismo; Pp Grillo no tiene prisa ni se impacienta.',
    color: '#EA4335',
  },
  {
    icon: Smile,
    title: 'El orgullo de resolverlo solo',
    body: 'Experimenta la satisfacción real de haber alcanzado el resultado por deducción propia.',
    color: '#4285F4',
  },
  {
    icon: HandHeart,
    title: 'Tardes libres de angustia',
    body: 'Termina sus deberes a tiempo y descansa por las noches sin tareas acumuladas.',
    color: '#34A853',
  },
]

const schoolBenefits: Benefit[] = [
  {
    icon: CalendarCheck,
    title: 'Tareas completas y puntuales',
    body: 'Llega a clases con los ejercicios entendidos y resueltos a tiempo.',
    color: '#34A853',
  },
  {
    icon: Presentation,
    title: 'Seguridad en el aula',
    body: 'Al comprender el procedimiento, participa con confianza ante sus profesores y compañeros.',
    color: '#4285F4',
  },
  {
    icon: Award,
    title: 'Aprobado en los exámenes',
    body: 'Al no memorizar respuestas regaladas, domina el método analítico frente a una hoja en blanco.',
    color: '#FBBC05',
  },
  {
    icon: Brain,
    title: 'Pensamiento crítico duradero',
    body: 'Desarrolla análisis y razonamiento autónomo para secundaria, preparatoria y universidad.',
    color: '#EA4335',
  },
]

export default function Page() {
  return (
    <BrandFonts>
      <SignupModalProvider
        category="padres"
        title="Activa sus 14 días gratis"
        subtitle="Solo el nombre de tu hijo y su WhatsApp. En 1 minuto tiene a su tutor."
        submitLabel="Activar su tutor"
      >
        <div className="min-h-screen overflow-x-hidden bg-background">
          <SiteHeader />
          <main>
            <Hero />
            <BenefitGrid
              id="beneficios"
              eyebrow="Para ti, mamá o papá"
              title="Tu rol es quererlo y guiarlo, no desgastarte haciendo ecuaciones"
              benefits={parentBenefits}
              tinted
            />
            <BenefitGrid
              eyebrow="Para tu hijo"
              title="Un tutor que nunca se desespera ni lo hace sentir mal"
              benefits={childBenefits}
            />
            <FamilySection />
            <BenefitGrid
              id="pedagogia"
              eyebrow="En la escuela"
              title="Resultados visibles en la libreta y en el aula"
              benefits={schoolBenefits}
            />
            <FeaturesSection />
            <HomePricing />
          </main>
          <SiteFooter />
          <ChatWidget />
        </div>
      </SignupModalProvider>
    </BrandFonts>
  )
}
