'use client'

import { Button } from '@/components/ui/button'
import { Plus, LogOut, X, MessageCircle, GraduationCap, Crown, Clock, FlaskConical } from 'lucide-react'
import { PpGrilloWordmark } from './brand-mark'
import type { StudentProfile, TutorSession } from './types'

export function AppSidebar({
  profile,
  sessions,
  activeId,
  open,
  isSubscribed,
  daysLeft,
  onClose,
  onNewConsulta,
  onSelectSession,
  onToggleTrial,
  onLogout,
}: {
  profile: StudentProfile
  sessions: TutorSession[]
  activeId: string
  open: boolean
  isSubscribed: boolean
  daysLeft: number
  onClose: () => void
  onNewConsulta: () => void
  onSelectSession: (id: string) => void
  onToggleTrial: () => void
  onLogout: () => void
}) {
  const trialExpired = !isSubscribed && daysLeft <= 0
  return (
    <>
      {/* mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-sidebar transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <a href="/" aria-label="Ir al inicio">
            <PpGrilloWordmark className="text-xl" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-accent lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3">
          <Button
            onClick={onNewConsulta}
            className="h-auto w-full justify-start gap-2 rounded-2xl py-3 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Nueva consulta
          </Button>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto px-3">
          <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Sesiones recientes
          </p>
          {sessions.length === 0 ? (
            <p className="px-2 text-[13px] leading-relaxed text-slate-400">
              Tus sesiones de razonamiento aparecerán aquí.
            </p>
          ) : (
            <ul className="space-y-1">
              {sessions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSession(s.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
                      s.id === activeId
                        ? 'bg-accent text-accent-foreground'
                        : 'text-slate-600 hover:bg-accent/60'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{s.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 p-3">
          {/* Estado de la cuenta */}
          {isSubscribed ? (
            <div className="mb-2 flex items-center gap-2.5 rounded-2xl bg-primary/10 px-3 py-2.5">
              <Crown className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-bold text-primary">Plan Activo</span>
              <span className="ml-auto text-[11px] font-medium text-primary/70">Ilimitado</span>
            </div>
          ) : (
            <div
              className={`mb-2 flex items-center gap-2.5 rounded-2xl px-3 py-2.5 ${
                trialExpired ? 'bg-red-50' : 'bg-accent/60'
              }`}
            >
              <Clock className={`h-4 w-4 shrink-0 ${trialExpired ? 'text-red-500' : 'text-primary'}`} />
              <span className={`text-sm font-semibold ${trialExpired ? 'text-red-600' : 'text-slate-700'}`}>
                {trialExpired ? 'Prueba vencida' : `Prueba: ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`}
              </span>
            </div>
          )}

          {/* Simulador de estado de prueba (para pruebas) */}
          {!isSubscribed && (
            <button
              type="button"
              onClick={onToggleTrial}
              className="mb-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-[12px] font-medium text-slate-500 transition-colors hover:border-primary/40 hover:text-primary"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              Simular: {trialExpired ? 'activar prueba' : 'vencer prueba'}
            </button>
          )}

          <div className="flex items-center gap-3 rounded-2xl bg-accent/60 px-3 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-extrabold text-primary">
              {profile.studentName.charAt(0).toUpperCase() || 'A'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{profile.studentName || 'Alumno'}</p>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <GraduationCap className="h-3 w-3" />
                {profile.grade}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-accent hover:text-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
