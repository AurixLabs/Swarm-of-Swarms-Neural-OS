
// WASM Service Worker - COMPLETELY PASSIVE - Only activates when CMA initializes
console.log('🔧 WASM Service Worker: Passive mode (no auto-loading)');

const CACHE_NAME = 'cma-wasm-cache-v4-passive';

// STRICT whitelist - ONLY WASM files
const WASM_FILE_PATTERNS = [
  /\.wasm$/,
  /\/wasm\/.*\.js$/,
];

// Files that should NEVER be intercepted
const NEVER_INTERCEPT = [
  'package.json',
  'vite.config.ts',
  'vite.config.js',
  'node_modules',
  '@vite',
  '@fs',
  'src/',
  'main.tsx',
  'App.tsx',
  'bootstrap.ts'
];

function shouldHandleRequest(url) {
  const pathname = new URL(url).pathname;
  
  // Never intercept build system files
  if (NEVER_INTERCEPT.some(pattern => pathname.includes(pattern))) {
    return false;
  }
  
  // Only handle WASM-related files
  return WASM_FILE_PATTERNS.some(pattern => pattern.test(pathname));
}

self.addEventListener('install', (event) => {
  console.log('🔧 WASM Service Worker: Installing in passive mode...');
  
  // Skip waiting in development to avoid conflicts
  if (self.location.hostname === 'localhost') {
    self.skipWaiting();
  }
  
  // Don't pre-cache anything - wait for CMA initialization
  event.waitUntil(
    caches.open(CACHE_NAME).then(() => {
      console.log('✅ WASM Service Worker: Installed (passive mode)');
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🚀 WASM Service Worker: Activated (passive mode)');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ WASM Service Worker: Cleanup complete');
      self.clients.claim();
    })
  );
});

// ONLY intercept WASM requests - let everything else pass through
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  if (!shouldHandleRequest(url)) {
    return; // Let browser handle normally
  }
  
  console.log('📦 WASM Service Worker: Handling WASM request:', url);
  event.respondWith(handleWasmRequest(event.request));
});

async function handleWasmRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Serving cached WASM:', request.url);
      return cachedResponse;
    }
    
    console.log('🌐 Fetching WASM from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      console.log('✅ WASM cached successfully:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ WASM fetch failed:', error);
    throw error;
  }
}

// Passive message handling
self.addEventListener('message', (event) => {
  const { type } = event.data;
  
  if (type === 'WASM_STATUS_CHECK') {
    event.ports[0].postMessage({
      type: 'WASM_SERVICE_WORKER_READY',
      mode: 'passive',
      timestamp: Date.now()
    });
  }
});
