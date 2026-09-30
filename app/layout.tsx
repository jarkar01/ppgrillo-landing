import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { MetaPixel } from '@/components/meta-pixel'
import './globals.css'

export const metadata: Metadata = {
  title: 'PpGrillo · Deja de pelear por la tarea. Recupera la paz de tus tardes',
  description:
    'Tutor socrático K-8 a K-12 en WhatsApp con paciencia infinita. Tu hijo aprende a razonar por su cuenta y tú recuperas la paz en casa. 14 días gratis, sin tarjeta.',
  generator: 'v0.app',
  applicationName: 'PpGrillo',
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0E8F63',
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light scroll-smooth">
      <body className="font-body antialiased">
        {children}
        <MetaPixel />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
