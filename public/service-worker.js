const APP_PREFIX = 'PWA_Budget';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  "/",
  "js/index.js",
  "js/idb.js",
  "index.html",
  "manifest.json",
  "css/styles.css",
  "icons/icon-72x72.png",
  "icons/icon-96x96.png",
  "icons/icon-128x128.png",
  "icons/icon-144x144.png",
  "icons/icon-152x152.png",
  "icons/icon-192x192.png",
  "icons/icon-384x384.png",
  "icons/icon-512x512.png",
];

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(FILES_TO_CACHE))
    )
    self.skipWaiting()
})

self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          })
        )
      })
    )
    self.clients.claim()
})

self.addEventListener('fetch', event => {
    //Online first, then falls back to cache if it dosnt work
    if (event.request.method === 'GET') {
      event.respondWith(
        // open caches
        caches.open(CACHE_NAME)
          .then(cache => {
            // tries the network with a fetch request
            return fetch(event.request)
              .then(response => {
                // success
                if (response.status === 200) {
                  // saves response in cache
                  cache.put(event.request.url, response.clone())
                }
                return response
              })
              // if fails pulls last saved data from cache
              .catch(() => caches.match(event.request))
          })
          .catch(err => console.log(err))
      )
      return
    }
  
    // uses cache first then falls back to network if it dosnt work
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    )
})