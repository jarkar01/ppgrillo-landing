'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { LogOut, RefreshCw, Search } from 'lucide-react'
import { adminLogout } from '@/app/admin/actions'
import type { AdminStatus, AdminUserRow } from '@/lib/admin-users'
import { AdminUsersTable } from '@/components/admin/admin-users-table'

type UsersResponse = { users: AdminUserRow[]; fetchedAt: string }

const REFRESH_MS = 15_000

async function fetchUsers(url: string): Promise<UsersResponse> {
  const res = await fetch(url, { cache: 'no-store' })
  if (res.status === 401) {
    window.location.reload()
    throw new Error('unauthorized')
  }
  if (!res.ok) throw new Error('No se pudo consultar Firestore')
  return res.json()
}

type Filter = 'all' | AdminStatus

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'trial', label: 'En prueba' },
  { id: 'trial_ended', label: 'Límite alcanzado' },
  { id: 'active', label: 'Suscripción activa' },
]

export function AdminDashboard({ initialData }: { initialData?: UsersResponse }) {
  const { data, error, isValidating, mutate } = useSWR('/api/admin/users', fetchUsers, {
    fallbackData: initialData,
    refreshInterval: REFRESH_MS,
    revalidateOnFocus: true,
    revalidateOnMount: !initialData,
  })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const users = data?.users ?? []
  const counts = useMemo(
    () => ({
      all: users.length,
      trial: users.filter((u) => u.status === 'trial').length,
      trial_ended: users.filter((u) => u.status === 'trial_ended').length,
      active: users.filter((u) => u.status === 'active').length,
    }),
    [users],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter(
      (u) =>
        (filter === 'all' || u.status === filter) &&
        (!q || u.email.includes(q) || u.name?.toLowerCase().includes(q)),
    )
  }, [users, query, filter])

  const updated = data?.fetchedAt
    ? new Date(data.fetchedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : undefined

  return (
    <div className="min-h-dvh bg-muted">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-foreground">
              Pp<span className="text-primary">Grillo</span>
            </span>
            <span className="text-xs text-muted-foreground">Panel de administración</span>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold text-foreground text-balance md:text-3xl">Usuarios</h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <span
              className={`size-2 rounded-full ${error ? 'bg-destructive' : 'bg-primary'} ${isValidating ? 'animate-pulse' : ''}`}
              aria-hidden="true"
            />
            {error
              ? 'Sin conexión con Firestore. Reintentando…'
              : `En vivo desde Firestore · se actualiza cada ${REFRESH_MS / 1000} s${updated ? ` · ${updated}` : ''}`}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="admin-search" className="sr-only">
              Buscar por correo o nombre
            </label>
            <input
              id="admin-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por correo o nombre"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estatus">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                }`}
              >
                {f.label}
                <span className={filter === f.id ? 'opacity-80' : 'text-muted-foreground'}>{counts[f.id]}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => mutate()}
              className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent"
              aria-label="Actualizar ahora"
            >
              <RefreshCw className={`size-4 ${isValidating ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        <AdminUsersTable users={visible} loading={!data && !error} />

        <p className="text-xs leading-relaxed text-muted-foreground">
          Solo aparecen familias con correo registrado. Las pruebas gratuitas sin correo viven únicamente en el
          dispositivo del alumno. Tareas: de por vida en la prueba gratuita; del mes en curso en planes de pago.
        </p>
      </main>
    </div>
  )
}
