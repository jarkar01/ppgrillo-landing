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
import { CampaignLanding } from '@/components/campaign/campaign-landing'
import { SiteFooter } from '@/components/site-footer'
import { ChatWidget } from '@/components/chat-widget'
import { BenefitGrid, type Benefit } from '@/components/estudiantes/benefit-grid'
import { FamilySection } from '@/components/home/family-section'
import { FeaturesSection } from '@/components/home/features-section'
import { HomePricing } from '@/components/home/home-pricing'
import { InlineTrialCta } from '@/components/home/inline-trial-cta'
import { MobileStickyCta } from '@/components/home/mobile-sticky-cta'

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
        <div className="min-h-screen overflow-x-hidden bg-background pb-28 md:pb-0">
          <main>
            <CampaignLanding
              headline="Deja de pelear por la tarea. Recupera la paz de tus tardes."
              subhead="Tu hijo aprende a razonar paso a paso por WhatsApp. Sin descargar apps ni crear cuentas."
              chat={{
                caption: 'Ayúdame con este, porfa',
                reply: '¡Vamos juntos! ¿Qué operación crees que deberíamos resolver primero?',
              }}
              footerHref="#saber-mas"
              footerLabel="¿Quieres conocer a fondo la metodología y el servicio? Sigue leyendo ↓"
            />
            <div id="saber-mas" className="scroll-mt-20">
            <BenefitGrid
              id="beneficios"
              eyebrow="Para ti, mamá o papá"
              title="Tu rol es quererlo y guiarlo, no desgastarte haciendo ecuaciones"
              benefits={parentBenefits}
              tinted
              compactMobile
            />
            <BenefitGrid
              eyebrow="Para tu hijo"
              title="Un tutor que nunca se desespera ni lo hace sentir mal"
              benefits={childBenefits}
              compactMobile
            />
            <FamilySection />
            <BenefitGrid
              id="pedagogia"
              eyebrow="En la escuela"
              title="Resultados visibles en la libreta y en el aula"
              benefits={schoolBenefits}
              compactMobile
            >
              <InlineTrialCta />
            </BenefitGrid>
            <FeaturesSection />
            </div>
            <HomePricing />
          </main>
          <SiteFooter />
          <ChatWidget liftOnMobile />
          <MobileStickyCta revealAfterHero />
        </div>
    </BrandFonts>
  )
}
