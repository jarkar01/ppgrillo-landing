import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { PainSection } from '@/components/pain-section'
import { SocraticSection } from '@/components/socratic-section'
import { ReportSection } from '@/components/report-section'
import { SummerCamp } from '@/components/summer-camp'
import { Pricing } from '@/components/pricing'
import { SiteFooter } from '@/components/site-footer'
import { ChatWidget } from '@/components/chat-widget'

export default function Page() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <PainSection />
        <SocraticSection />
        <ReportSection />
        <SummerCamp />
        <Pricing />
      </main>
      <SiteFooter />
      <ChatWidget />
    </div>
  )
}
