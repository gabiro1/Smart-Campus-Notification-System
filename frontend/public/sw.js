// This isn't just a "page," but a file in your public/ folder. It allows the app to load even if the student's data bundle is finished.
/**
 * @file ServiceWorker
 * @description Enables Progressive Web App (PWA) features.
 * ROLE: Caches the latest alerts so they are readable without internet.
 */

const CACHE_NAME = 'uninotify-v1';
const ASSETS = ['/', '/index.html', '/feed', '/offline.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});