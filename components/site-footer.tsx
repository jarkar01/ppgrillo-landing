import Link from 'next/link'
import { ShieldCheck, ChevronRight, Sparkles, Handshake } from 'lucide-react'
import { BrandIdentity, CollaborationNote } from '@/components/brand-identity'

function GoogleCloudMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12 shrink-0" role="img" aria-label="Google Cloud">
      <path
        d="M30 9c-1.6-3.6-5.2-6-9.4-6C15 3 10.5 7.2 10 12.6 6.5 13.3 4 16.3 4 20c0 4.2 3.4 7.6 7.6 7.6h22.8C39 27.6 43 23.6 43 18.7c0-4.7-3.7-8.6-8.4-8.9A10 10 0 0 0 30 9Z"
        fill="none"
        stroke="#4285F4"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="17" r="2.4" fill="#EA4335" />
      <circle cx="24" cy="17" r="2.4" fill="#FBBC05" />
      <circle cx="31" cy="17" r="2.4" fill="#34A853" />
    </svg>
  )
}

function PartnerCard({
  children,
  label,
}: {
  children: React.ReactNode
  label?: string
}) {
  return (
    <li className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 shadow-sm">
      {children}
      {label ? <span className="sr-only">{label}</span> : null}
    </li>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative z-20 border-t border-slate-200/70 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-slate-500">
            Con el respaldo de
          </p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <PartnerCard label="Google Cloud y Vertex AI">
              <GoogleCloudMark />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-base font-bold text-slate-700">Google Cloud</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Vertex AI
                </span>
              </span>
            </PartnerCard>

          <PartnerCard label="Arka Universidad">
            <span className="flex items-center gap-1.5 rounded-lg bg-[#E50914] px-2.5 py-1.5 shadow-sm">
              <span className="font-display text-base font-extrabold tracking-tight text-white">
                Arka
              </span>
              <span className="flex items-center -space-x-1.5 text-white" aria-hidden="true">
                <ChevronRight className="h-4 w-4" strokeWidth={3} />
                <ChevronRight className="h-4 w-4" strokeWidth={3} />
                <ChevronRight className="h-4 w-4" strokeWidth={3} />
              </span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Universidad
            </span>
          </PartnerCard>

            <PartnerCard label="Ed1to1 Inc.">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-emerald-300 shadow-sm">
                <Sparkles className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="flex items-baseline gap-1">
                <span className="font-display text-lg font-black tracking-tighter text-slate-900">
                  Ed
                  <span className="text-emerald-500">1to1</span>
                </span>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                  Inc.
                </span>
              </span>
            </PartnerCard>

            <PartnerCard label="Mercado Pago">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm"
                style={{ backgroundColor: '#009EE3' }}
              >
                <Handshake className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="flex flex-col leading-tight">
                <span
                  className="font-display text-base font-extrabold tracking-tight"
                  style={{ color: '#009EE3' }}
                >
                  Mercado Pago
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pagos seguros
                </span>
              </span>
            </PartnerCard>
          </ul>
        </div>

        <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-card px-5 py-4 text-sm text-slate-600 shadow-sm">
          <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
          <span>
            Estándares de seguridad escolar: protocolos <strong>COPPA</strong> y{' '}
            <strong>FERPA</strong>.
          </span>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-slate-200 pt-8 sm:flex-row">
          <BrandIdentity align="start" className="max-sm:items-center" />
          <nav className="relative z-20 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link
              href="/privacidad"
              className="inline-block cursor-pointer px-1 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
            >
              Aviso de Privacidad
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">
              |
            </span>
            <Link
              href="/terminos"
              className="inline-block cursor-pointer px-1 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
            >
              Términos del Servicio
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">
              |
            </span>
            <a
              href="mailto:jfalomir@arkaedu.com?subject=Contacto%20PpGrillo"
              className="inline-block cursor-pointer px-1 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
            >
              Contacto
            </a>
          </nav>
        </div>

        <CollaborationNote className="mx-auto mt-6 max-w-2xl text-center" />

        <p className="mt-3 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Arka Universidad Digital S.A. de C.V. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  )
}
