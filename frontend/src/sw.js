// Minimal Service Worker for PWA
self.addEventListener('install', (event) => {
  console.log('Service Worker installed')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated')
  self.clientsClaim()
})

self.addEventListener('fetch', (event) => {
  // Simple fetch handler
  event.respondWith(fetch(event.request))
})
