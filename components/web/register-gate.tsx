'use client'

import { useRouter } from 'next/navigation'
import { BrandIdentity } from '@/components/brand-identity'
import { StartFreeForm } from '@/components/web/start-free'
import { FREE_LIFETIME_TASKS } from '@/lib/plans'

export function RegisterGate() {
  const router = useRouter()
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-10">
      <BrandIdentity />
      <div className="flex w-full flex-col gap-5 rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-balance text-slate-900">
            Empieza con {FREE_LIFETIME_TASKS} tareas gratis
          </h1>
          <p className="text-sm leading-relaxed text-pretty text-slate-600">
            Solo necesitamos tu nombre para desbloquear tus tareas de cortesía de por vida.
          </p>
        </div>
        <StartFreeForm onSuccess={() => router.refresh()} />
      </div>
    </div>
  )
}
