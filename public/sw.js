const VERSION = 'v5'
const CACHE_NAME = `perfecto-${VERSION}`
const IMAGE_CACHE_NAME = `perfecto-images-${VERSION}`
const PRECACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(PRECACHE)
      })
  )
  self.skipWaiting()
})

// Fetch event
self.addEventListener('fetch', function(event) {
  const req = event.request
  const url = new URL(req.url)

  // Only handle same-origin GET requests
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  // Handle images with long-term caching
  if (req.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return cache.match(req).then(cached => {
          if (cached) {
            return cached
          }
          return fetch(req).then(response => {
            if (response && response.status === 200) {
              cache.put(req, response.clone())
            }
            return response
          })
        })
      })
    )
    return
  }

  // Navigation requests: network first with cache fallback to offline page (root)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone))
          }
          return res
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/')))
    )
    return
  }

  // Static assets and pages: stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone))
          }
          return res
        })
        .catch(() => cached)

      return cached || fetchPromise
    })
  )
})

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
  // أعلِم كل العملاء بوجود نسخة جديدة لتحديث واجهة التطبيق فوراً
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => client.postMessage({ type: 'NEW_VERSION', version: VERSION }))
  })
})

// قبول رسالة من العميل لتجاوز الانتظار يدوياً
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
