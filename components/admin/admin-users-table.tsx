import type { AdminStatus, AdminUserRow } from '@/lib/admin-users'

const STATUS: Record<AdminStatus, { label: string; className: string; dot: string }> = {
  trial: { label: 'En prueba', className: 'bg-muted text-foreground', dot: 'bg-muted-foreground' },
  trial_ended: {
    label: 'Prueba terminada / Límite alcanzado',
    className: 'bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
  active: { label: 'Suscripción activa', className: 'bg-accent text-accent-foreground', dot: 'bg-primary' },
}

function StatusBadge({ status }: { status: AdminStatus }) {
  const s = STATUS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  )
}

function TasksCell({ user }: { user: AdminUserRow }) {
  const scope = user.tasksScope === 'month' ? 'este mes' : 'de cortesía'
  if (user.tasksLimit === null) {
    return (
      <div className="flex flex-col">
        <span className="font-semibold tabular-nums text-foreground">{user.tasksUsed}</span>
        <span className="text-xs text-muted-foreground">ilimitadas · {scope}</span>
      </div>
    )
  }
  const pct = Math.min(100, Math.round((user.tasksUsed / user.tasksLimit) * 100))
  const full = user.tasksUsed >= user.tasksLimit
  return (
    <div className="flex min-w-28 flex-col gap-1.5">
      <span className="text-sm tabular-nums text-foreground">
        <span className="font-semibold">{user.tasksUsed}</span>
        <span className="text-muted-foreground"> / {user.tasksLimit} {scope}</span>
      </span>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={user.tasksLimit}
        aria-valuenow={user.tasksUsed}
        aria-label={`${user.tasksUsed} de ${user.tasksLimit} tareas`}
      >
        <div className={`h-full rounded-full ${full ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AdminUsersTable({ users, loading }: { users: AdminUserRow[]; loading: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Nombre / Correo</th>
              <th scope="col" className="px-4 py-3 font-semibold">Plan actual</th>
              <th scope="col" className="px-4 py-3 font-semibold">Tareas utilizadas</th>
              <th scope="col" className="px-4 py-3 font-semibold">Estatus</th>
              <th scope="col" className="px-4 py-3 font-semibold">Última tarea</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.email} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{user.name ?? 'Sin nombre'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{user.planLabel}</span>
                    {user.plan === 'free' && user.planStatus === 'pending_payment' && (
                      <span className="text-xs text-muted-foreground">Pago pendiente</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <TasksCell user={user} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{formatDate(user.lastTaskAt)}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  {loading ? 'Cargando usuarios…' : 'No hay usuarios que coincidan con el filtro.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
