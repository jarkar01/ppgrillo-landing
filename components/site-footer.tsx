import Link from 'next/link'
import { ShieldCheck, ChevronRight, Sparkles, Handshake } from 'lucide-react'

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
    <footer className="border-t border-slate-200/70 bg-secondary/40">
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="font-display text-xl font-extrabold leading-none tracking-tight sm:text-2xl">
              <span style={{ color: '#EA4335' }}>P</span>
              <span style={{ color: '#34A853' }}>p</span>
              <span style={{ color: '#4285F4' }}>Grill</span>
              <span style={{ color: '#FBBC05' }}>o</span>
            </span>
            <span className="font-display text-[0.7rem] font-semibold tracking-wide text-slate-500">
              powered by Google
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <Link
              href="/privacidad"
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
            >
              Aviso de Privacidad
            </Link>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} PpGrillo. Aprender a pensar, en familia.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
