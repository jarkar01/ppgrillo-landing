// Network-only worker: enables "install app" without caching pages, so users
// always get the latest version. Also clears caches left by older workers.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', () => {
  // Intentionally empty: requests go straight to the network.
})
