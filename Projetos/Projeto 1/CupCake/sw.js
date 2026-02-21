// Service Worker for PWA
const CACHE_NAME = 'cupcake-delicia-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/Cardapio.html',
    '/Cardapio.css',
    '/Sobre.html',
    '/Sobre.css',
    '/Contato.html',
    '/Contato.css',
    '/Pagamentos.html',
    '/Pagamentos.css',
    '/admin.html',
    '/admin.css',
    '/admin.js',
    '/images/cupcake-1.jpg',
    '/images/cupcake-2.jpg',
    '/images/cupcake-3.jpg',
    '/images/cupcake-4.jpg',
    '/images/cupcake-5.jpg',
    '/images/cupcake-6.jpg',
    '/images/hero-bg.jpg'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
