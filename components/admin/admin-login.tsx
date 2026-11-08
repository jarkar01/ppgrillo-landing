'use client'

import { useActionState } from 'react'
import { Lock } from 'lucide-react'
import { adminLogin, type AdminLoginState } from '@/app/admin/actions'

export function AdminLogin({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<AdminLoginState, FormData>(adminLogin, {})

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-12">
      <form
        action={action}
        className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-border bg-background p-8 shadow-sm"
      >
        <div className="flex flex-col items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-bold text-foreground text-balance">Panel de administración</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Acceso privado al estatus de las familias de PpGrillo.
          </p>
        </div>

        {configured ? (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                autoFocus
                className="h-11 rounded-lg border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {state.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="h-11 rounded-lg bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? 'Entrando…' : 'Entrar'}
            </button>
          </>
        ) : (
          <p role="alert" className="rounded-lg bg-muted p-3 text-sm leading-relaxed text-foreground">
            Configura la variable <code className="font-mono">ADMIN_PASSWORD</code> en Vars para habilitar este panel.
          </p>
        )}
      </form>
    </main>
  )
}
