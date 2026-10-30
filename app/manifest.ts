import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/app',
    name: 'PpGrillo',
    short_name: 'PpGrillo',
    description: 'Tutor socrático de tareas',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'es',
    background_color: '#ffffff',
    theme_color: '#0E8F63',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
