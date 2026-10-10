import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
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
import { CampaignStickyBar } from '@/components/campaign/campaign-sticky-bar'
import { WHATSAPP_SHARE_CONTACT_URL, WHATSAPP_TRIAL_URL } from '@/lib/whatsapp'
import { SiteFooter } from '@/components/site-footer'
import { BrandIdentity, CollaborationNote } from '@/components/brand-identity'
import { ChatWidget } from '@/components/chat-widget'
import { BenefitGrid, type Benefit } from '@/components/estudiantes/benefit-grid'
import { FamilySection } from '@/components/home/family-section'
import { FeaturesSection } from '@/components/home/features-section'
import { HomePricing } from '@/components/home/home-pricing'

export const metadata: Metadata = {
  title: 'Metodología PpGrillo · Tutor socrático por WhatsApp',
  description:
    'Conoce a fondo cómo PpGrillo guía a tu hijo paso a paso con preguntas, sin darle respuestas, y lo que obtiene tu familia.',
}

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

function BackToTrialButton() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
    >
      <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
      Volver al inicio
    </Link>
  )
}

export default function MetodoPage() {
  return (
    <BrandFonts>
      <div className="min-h-screen overflow-x-hidden bg-background pb-20 md:pb-0">
        <header className="border-b border-slate-200/70 bg-card/80">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-5 sm:flex-row sm:justify-between sm:px-8">
            <Link href="/" aria-label="Ir al inicio de PpGrillo" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4285F4]">
              <BrandIdentity align="start" className="max-sm:items-center" />
            </Link>
            <BackToTrialButton />
          </div>
          <div className="border-t border-slate-200/70 bg-secondary/40 px-5 py-2.5">
            <CollaborationNote className="mx-auto max-w-3xl text-center" />
          </div>
        </header>
        <main>
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
          />
          <FeaturesSection />
          <HomePricing />
          <div className="flex justify-center px-5 py-12">
            <BackToTrialButton />
          </div>
        </main>
        <SiteFooter />
        <CampaignStickyBar chatHref={WHATSAPP_TRIAL_URL} shareHref={WHATSAPP_SHARE_CONTACT_URL} />
        <ChatWidget liftOnMobile />
      </div>
    </BrandFonts>
  )
}
