import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { WHATSAPP_URL } from '@/lib/whatsapp'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <a href="#" className="flex flex-col items-start leading-none" aria-label="PpGrillo, powered by Google">
          <span className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            <span style={{ color: '#EA4335' }}>Pp</span>
            <span style={{ color: '#4285F4' }}>Grillo</span>
          </span>
          <span className="mt-1 flex w-full items-center justify-end gap-1 text-[11px] font-medium text-slate-500">
            powered by{' '}
            <span className="font-semibold">
              <span style={{ color: '#4285F4' }}>G</span>
              <span style={{ color: '#EA4335' }}>o</span>
              <span style={{ color: '#FBBC05' }}>o</span>
              <span style={{ color: '#4285F4' }}>g</span>
              <span style={{ color: '#34A853' }}>l</span>
              <span style={{ color: '#EA4335' }}>e</span>
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#pedagogia" className="transition-colors hover:text-primary">
            Cómo funciona
          </a>
          <a href="#verano" className="transition-colors hover:text-primary">
            Campamento
          </a>
          <a href="#precios" className="transition-colors hover:text-primary">
            Precios
          </a>
        </nav>

        <Button
          nativeButton={false}
          render={<a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" />}
          className="h-auto min-w-[160px] gap-2 whitespace-nowrap rounded-full bg-[#25D366] px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-[#20bd5a]"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          Empezar gratis
        </Button>
      </div>
    </header>
  )
}
