'use client'

import { BadgeCheck, CircleAlert, Loader2, RefreshCw } from 'lucide-react'
import type { PaidPlanId } from '@/lib/plans'

const PLAN_NAMES: Record<PaidPlanId, string> = {
  standard: 'Plan Estándar',
  family: 'Plan Familiar',
}

export function PlanBadge({ plan }: { plan?: PaidPlanId }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#128C7E]">
      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
      {plan ? `${PLAN_NAMES[plan]} activo` : 'Plan activo'}
    </div>
  )
}

export function ActivationCard({ delayed, onCheck }: { delayed: boolean; onCheck: () => void }) {
  return (
    <div role="status" className="flex flex-col gap-3 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-4 text-left">
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#128C7E]" aria-hidden="true" />
        <p className="font-display text-lg font-bold text-slate-900">Activando tu cuenta…</p>
      </div>
      <p className="text-sm leading-relaxed text-pretty text-slate-700">
        {delayed
          ? 'Mercado Pago está tardando un poco más de lo normal en confirmar el pago. Seguimos revisando automáticamente; en cuanto llegue la confirmación se abre el chat aquí mismo.'
          : 'Estamos confirmando tu pago con Mercado Pago. Suele tardar solo unos segundos; no necesitas hacer nada.'}
      </p>
      {delayed ? (
        <button
          type="button"
          onClick={onCheck}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border-2 border-[#25D366] px-4 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Verificar ahora
        </button>
      ) : null}
    </div>
  )
}

export function ActivatedNotice({ firstName, plan }: { firstName: string; plan?: PaidPlanId }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-left">
      <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#128C7E]" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-pretty text-slate-700">
        <span className="font-semibold text-slate-900">¡Listo, {firstName}! Tu {plan ? PLAN_NAMES[plan] : 'plan'} ya está activo.</span>{' '}
        Ya puedes seguir con tus tareas.
      </p>
    </div>
  )
}

export function PaymentFailedNotice() {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-left">
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-pretty text-slate-700">
        El pago no se completó en Mercado Pago, así que no se hizo ningún cargo. Puedes intentarlo de nuevo con otro método de pago.
      </p>
    </div>
  )
}
