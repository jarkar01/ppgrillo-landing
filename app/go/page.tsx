import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BrandFonts } from '@/components/brand-fonts'
import { PpGrilloAvatar, PpGrilloWordmark } from '@/components/app/brand-mark'
import { ChatReplay } from '@/components/go/chat-replay'
import { ActivationCard } from '@/components/go/activation-card'
import { GoFaq } from '@/components/go/go-faq'

export const metadata: Metadata = {
  title: 'Pp Grillo | Deja de pelear con tu hijo por la tarea',
  description:
    'Mira cómo PpGrillo le enseña a razonar en segundos sin regalarle la respuesta. Activa 14 días gratis sin tarjeta de crédito.',
  alternates: { canonical: '/go' },
}

const FOOTER_LINKS = [
  { href: '/terminos', label: 'Términos del Servicio', newTab: true },
  { href: '/privacidad', label: 'Aviso de Privacidad', newTab: true },
  { href: '/contacto', label: 'Contacto', newTab: false },
]

export default function GoPage() {
  return (
    <BrandFonts>
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-emerald-50/80 via-background to-background">
        <header className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-4">
          <Link href="/go" className="flex items-center gap-2" aria-label="PpGrillo">
            <PpGrilloAvatar className="h-8 w-8" />
            <PpGrilloWordmark className="text-lg" />
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-right text-xs font-semibold text-slate-500 underline-offset-4 hover:text-emerald-700 hover:underline sm:text-sm"
          >
            Conoce el método pedagógico
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </a>
        </header>

        <main className="mx-auto flex max-w-xl flex-col gap-10 px-4 pb-16 pt-4">
          <section aria-labelledby="go-title" className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 text-center">
              <h1
                id="go-title"
                className="text-balance font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl"
              >
                Deja de pelear con tu hijo por la tarea.{' '}
                <span className="text-emerald-600">Recupera la paz de tus tardes.</span>
              </h1>
              <p className="text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                Mira cómo PpGrillo le enseña a razonar en segundos sin regalarle la respuesta:
              </p>
            </div>
            <ChatReplay />
          </section>

          <ActivationCard />
          <GoFaq />
        </main>

        <footer className="border-t border-slate-200 px-4 py-6">
          <nav aria-label="Legal" className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) =>
              link.newTab ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-slate-500 hover:text-emerald-700 hover:underline"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium text-slate-500 hover:text-emerald-700 hover:underline"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </footer>
      </div>
    </BrandFonts>
  )
}
