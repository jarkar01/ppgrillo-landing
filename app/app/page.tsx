import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { BrandFonts } from '@/components/brand-fonts'
import { RegisterGate } from '@/components/web/register-gate'
import { TutorChat } from '@/components/web/tutor-chat'
import { WEB_USER_COOKIE, getWebUser } from '@/lib/web-users'

export const metadata: Metadata = {
  title: 'PpGrillo · Tu tutor',
  description: 'Resuelve tus tareas paso a paso con el tutor socrático de PpGrillo.',
  robots: { index: false, follow: true },
}

export default async function AppPage() {
  const user = await getWebUser((await cookies()).get(WEB_USER_COOKIE)?.value)

  return (
    <BrandFonts>
      <main className="min-h-svh bg-background">
        {user ? <TutorChat name={user.name} initialTasksUsed={user.taskCount} /> : <RegisterGate />}
      </main>
    </BrandFonts>
  )
}
