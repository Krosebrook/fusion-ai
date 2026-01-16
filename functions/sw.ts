Deno.serve(async (req) => {
  const swCode = `
// Service Worker for FlashFusion PWA
// Implements caching strategies, offline support, and push notifications
const CACHE_VERSION = 'flashfusion-v3';
const STATIC_CACHE = 'flashfusion-static-v3';
const DYNAMIC_CACHE = 'flashfusion-dynamic-v3';
const IMAGE_CACHE = 'flashfusion-images-v3';

// Critical routes for offline access
const STATIC_ASSETS = [
  '/',
  '/Dashboard',
  '/Home',
  '/Marketplace',
  '/offline.html'
];

// Cache strategy patterns
const CACHE_STRATEGIES = {
  static: ['fonts.googleapis.com', 'fonts.gstatic.com', 'api.dicebear.com'],
  networkFirst: ['api/', 'functions/', '/entities/', '/integrations/'],
  cacheFirst: ['.js', '.css', '.woff2'],
  imageCache: ['.png', '.svg', '.jpg', '.jpeg', '.webp', '.gif', '.ico']
};

// Maximum cache age in milliseconds (7 days)
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !name.includes('v3'))
            .map((name) => caches.delete(name))
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
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

  // Cache-first for static assets (JS, CSS, fonts)
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

  // Image-specific caching strategy with size limits
  if (isMatch(url, CACHE_STRATEGIES.imageCache)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        
        return fetch(request).then((response) => {
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            // Only cache images under 5MB
            response.clone().blob().then((blob) => {
              if (blob.size < 5 * 1024 * 1024) {
                caches.open(IMAGE_CACHE).then((cache) => {
                  cache.put(request, clone);
                  // Limit image cache to 50 items
                  cache.keys().then((keys) => {
                    if (keys.length > 50) {
                      cache.delete(keys[0]);
                    }
                  });
                });
              }
            });
          }
          return response;
        }).catch(() => {
          // Return placeholder image on failure
          return new Response(
            '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect fill="#1e293b" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="16">Image Unavailable Offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        });
      })
    );
    return;
  }

  // Network-first for navigation with offline fallback
  if (request.mode === 'navigate') {
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
          // Try cached version
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return offline page as last resort
            return caches.match('/').catch(() => {
              return new Response(
                '<!DOCTYPE html><html><head><title>Offline</title><style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#fff;text-align:center;}h1{font-size:2rem;margin-bottom:1rem;}</style></head><body><div><h1>You\'re Offline</h1><p>Please check your connection and try again.</p></div></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
          });
        })
    );
    return;
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pipelines') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection restored
async function syncOfflineData() {
  try {
    // Get all pending requests from IndexedDB or similar
    const pendingRequests = await getPendingRequests();
    
    for (const req of pendingRequests) {
      await fetch(req.url, {
        method: req.method,
        body: req.body,
        headers: req.headers
      });
    }
    
    // Clear pending requests after successful sync
    await clearPendingRequests();
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Placeholder functions (implement with IndexedDB)
async function getPendingRequests() {
  return [];
}

async function clearPendingRequests() {
  return Promise.resolve();
}

// Push notifications with enhanced options
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    data: data.url || '/',
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'FlashFusion', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data || '/';
  
  // Handle action buttons
  if (event.action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
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