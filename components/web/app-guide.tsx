'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowLeft, Camera, CheckCircle2, MessageCircleQuestion, ShieldCheck, Sparkles } from 'lucide-react'
import { BrandIdentity } from '@/components/brand-identity'
import { FREE_LIFETIME_TASKS } from '@/lib/plans'

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
    icon: Sparkles,
    title: 'Cuando se acaben tus tareas gratis',
    body: 'Puedes elegir un plan para seguir estudiando sin límites. Tus papás reciben un reporte semanal por correo con tu avance.',
  },
  {
    icon: ShieldCheck,
    title: 'Tu información está protegida',
    body: 'Usamos tus mensajes y fotos solo para ayudarte con tus tareas. Puedes consultar los detalles en el aviso de privacidad.',
  },
] as const

export function AppGuide({ onClose }: { onClose: () => void }) {
  const backRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    backRef.current?.focus()
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-guide-title"
      className="fixed inset-0 z-50 flex flex-col bg-white"
    >
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <button
            ref={backRef}
            type="button"
            onClick={onClose}
            className="flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Regresar al chat
          </button>
          <BrandIdentity />
        </header>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
          <div className="flex flex-col gap-2">
            <h2 id="app-guide-title" className="font-display text-2xl font-bold text-balance text-slate-900">
              Cómo funciona PpGrillo
            </h2>
            <p className="text-sm leading-relaxed text-pretty text-slate-600">
              Todo lo que necesitas saber para sacarle provecho a tu tutor. Tu conversación sigue guardada; puedes
              regresar cuando quieras.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {SECTIONS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#128C7E]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-pretty text-slate-700">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-sm leading-relaxed text-slate-600">
            ¿Quieres conocer más?{' '}
            <Link href="/" className="font-semibold text-[#128C7E] underline underline-offset-2">
              Visita la página principal
            </Link>{' '}
            o revisa el{' '}
            <Link href="/privacidad" className="font-semibold text-[#128C7E] underline underline-offset-2">
              aviso de privacidad
            </Link>
            .
          </p>
        </div>

        <div className="border-t border-slate-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-base font-bold text-white transition-colors hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Regresar al chat
          </button>
        </div>
      </div>
    </div>
  )
}
