import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminLogin } from '@/components/admin/admin-login'
import { isAdminConfigured, isAdminSession } from '@/lib/admin-auth'
import { listAdminUsers } from '@/lib/admin-users'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Administración · PpGrillo',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  if (!(await isAdminSession())) {
    return <AdminLogin configured={isAdminConfigured()} />
  }
  const users = await listAdminUsers()
  return (
    <AdminDashboard
      initialData={users === 'error' ? undefined : { users, fetchedAt: new Date().toISOString() }}
    />
  )
}
