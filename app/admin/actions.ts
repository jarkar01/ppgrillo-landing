'use server'

import { redirect } from 'next/navigation'
import { endAdminSession, isAdminConfigured, startAdminSession, verifyAdminPassword } from '@/lib/admin-auth'

export type AdminLoginState = { error?: string }

export async function adminLogin(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  if (!isAdminConfigured()) return { error: 'Falta configurar ADMIN_PASSWORD en las variables del proyecto.' }
  const password = String(formData.get('password') ?? '')
  if (!password || !verifyAdminPassword(password)) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { error: 'Contraseña incorrecta.' }
  }
  await startAdminSession()
  redirect('/admin')
}

export async function adminLogout(): Promise<void> {
  await endAdminSession()
  redirect('/admin')
}
