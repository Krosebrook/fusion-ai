Deno.serve(async (req) => {
  const swCode = `
const CACHE_VERSION = 'flashfusion-v2';
const STATIC_CACHE = 'flashfusion-static-v2';
const DYNAMIC_CACHE = 'flashfusion-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/Dashboard',
  '/CICDAutomation',
  '/AdvancedAnalytics'
];

const CACHE_STRATEGIES = {
  static: ['fonts.googleapis.com', 'fonts.gstatic.com', 'api.dicebear.com'],
  networkFirst: ['api/', 'functions/'],
  cacheFirst: ['.js', '.css', '.woff2', '.png', '.svg', '.jpg', '.webp']
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.includes('v2'))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

const isMatch = (url, patterns) => patterns.some(p => url.includes(p));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Network-first for API calls
  if (isMatch(url, CACHE_STRATEGIES.networkFirst)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Check if this is an AI service request
          if (url.includes('/integrations/Core/InvokeLLM') || url.includes('/ai/')) {
            return new Response(
              JSON.stringify({
                status: 'offline',
                message: 'You are offline. Reconnect to access AI features.',
                error: 'NETWORK_ERROR'
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          return caches.match(request);
        })
    );
    return;
  }

  // Stale-while-revalidate for static assets
  if (isMatch(url, CACHE_STRATEGIES.cacheFirst) || isMatch(url, CACHE_STRATEGIES.static)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        
        // Return cached immediately, update in background
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Stale-while-revalidate for navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached || caches.match('/'));
        return cached || fetchPromise;
      })
    );
    return;
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pipelines') {
    event.waitUntil(syncPipelines());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'FlashFusion', {
      body: data.body || 'You have a new notification',
      icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=ff7b00',
      badge: 'https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=ff7b00',
      tag: data.tag || 'default',
      data: data.url || '/'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
`;

  return new Response(swCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=0",
      "Service-Worker-Allowed": "/"
    }
  });
});