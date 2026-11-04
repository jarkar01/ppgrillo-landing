'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { ArrowLeft, Camera, CheckCircle2, MessageCircleQuestion, ShieldCheck, Sparkles } from 'lucide-react'
import { BrandIdentity } from '@/components/brand-identity'
import {
  FAMILY_MAX_USERS,
  FAMILY_PRICE_MXN,
  FREE_LIFETIME_TASKS,
  STANDARD_MONTHLY_TASKS,
  STANDARD_PRICE_MXN,
  STANDARD_QUARTERLY_PRICE_MXN,
} from '@/lib/plans'

const CHAT_PATH = '/app'

const SECTIONS = [
  {
    icon: MessageCircleQuestion,
    title: 'Cómo te ayuda el tutor',
    body: 'PpGrillo no te da la respuesta de inmediato. Te hace preguntas paso a paso para que entiendas el ejercicio y llegues tú a la solución.',
  },
  {
    icon: Camera,
    title: 'Escribe o manda una foto',
    body: 'Puedes escribir tu ejercicio o tomarle una foto a tu libreta o libro con el botón de la cámara. Asegúrate de que se lea bien.',
  },
  {
    icon: CheckCircle2,
    title: 'Qué cuenta como una tarea',
    body: `Cada ejercicio que terminas cuenta como 1 tarea, sin importar cuántos mensajes uses. Tienes ${FREE_LIFETIME_TASKS} tareas gratis para probarlo.`,
  },
  {
    icon: ShieldCheck,
    title: 'Tu información está protegida',
    body: 'Usamos tus mensajes y fotos solo para ayudarte con tus tareas. Nunca compartimos tu información con terceros.',
  },
] as const

const PLANS = [
  {
    name: 'Plan Estándar',
    price: `$${STANDARD_PRICE_MXN} MXN/mes`,
    note: `o $${STANDARD_QUARTERLY_PRICE_MXN} MXN por 3 meses`,
    body: `Hasta ${STANDARD_MONTHLY_TASKS} tareas al mes y reporte semanal de avance para papás por correo.`,
  },
  {
    name: 'Plan Familiar',
    price: `$${FAMILY_PRICE_MXN} MXN/mes`,
    note: `hasta ${FAMILY_MAX_USERS} alumnos`,
    body: 'Tareas ilimitadas para toda la familia, con reporte semanal por correo para cada alumno.',
  },
] as const

const returnButtonClass =
  'flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] font-bold text-white transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]'

export function AppGuide() {
  const router = useRouter()
  const backRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    backRef.current?.focus()
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') router.push(CHAT_PATH)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  return (
    <div aria-labelledby="app-guide-title" role="region" className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <Link ref={backRef} href={CHAT_PATH} className={`${returnButtonClass} h-11 px-4 text-sm`}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Regresar al chat
          </Link>
          <BrandIdentity />
        </header>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 py-6">
          <div className="flex flex-col gap-2">
            <h1 id="app-guide-title" className="font-display text-2xl font-bold text-balance text-slate-900">
              Cómo funciona PpGrillo
            </h1>
            <p className="text-sm leading-relaxed text-pretty text-slate-600">
              Todo lo que necesitas saber para sacarle provecho a tu tutor. Tu conversación sigue guardada; puedes
              regresar al chat en cualquier momento.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {SECTIONS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#128C7E]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-base font-bold text-slate-900">{title}</h2>
                  <p className="text-sm leading-relaxed text-pretty text-slate-700">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <section aria-labelledby="app-guide-plans" className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#128C7E]" aria-hidden="true" />
              <h2 id="app-guide-plans" className="font-display text-xl font-bold text-slate-900">
                Planes
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-pretty text-slate-600">
              Cuando se acaben tus {FREE_LIFETIME_TASKS} tareas gratis, el chat te mostrará estas opciones para seguir
              estudiando. No tienes que hacer nada antes.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PLANS.map((plan) => (
                <div key={plan.name} className="flex flex-col gap-2 rounded-2xl border-2 border-slate-200 p-4">
                  <h3 className="font-display text-base font-bold text-slate-900">{plan.name}</h3>
                  <p className="flex flex-col">
                    <span className="font-display text-2xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500">{plan.note}</span>
                  </p>
                  <p className="text-sm leading-relaxed text-pretty text-slate-700">{plan.body}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-sm leading-relaxed text-slate-600">
            Consulta los detalles en el{' '}
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener"
              className="font-semibold text-[#128C7E] underline underline-offset-2"
            >
              aviso de privacidad
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
            .
          </p>
        </div>

        <div className="border-t border-slate-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Link href={CHAT_PATH} className={`${returnButtonClass} h-12 w-full text-base`}>
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Regresar al chat
          </Link>
        </div>
      </div>
    </div>
  )
}
