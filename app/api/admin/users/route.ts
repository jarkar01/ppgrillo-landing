import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/admin-auth'
import { listAdminUsers } from '@/lib/admin-users'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }
  const users = await listAdminUsers()
  if (users === 'error') {
    return NextResponse.json({ error: 'firestore_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
  return NextResponse.json(
    { users, fetchedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
