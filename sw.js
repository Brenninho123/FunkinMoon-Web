const CACHE_NAME = 'moon-engine-v2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './assets/images/iconMoon.png',
    './assets/sounds/scrollMenu.ogg',
    './source/funkin/Preferences.js',
    './source/funkin/Paths.js',
    './source/funkin/online/Online.js',
    './source/funkin/api/discord/DiscordLogin.js',
    './source/funkin/ui/community/CommunityMenu.js',
    './source/funkin/ui/options/OptionsState.js',
    './source/funkin/play/PlayState.js',
    './source/Main.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin === self.location.origin) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    fetch(event.request).then((networkResponse) => {
                        if (networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, networkResponse);
                            });
                        }
                    }).catch(() => {});
                    return cachedResponse;
                }

                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
        );
    } else {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
    }
});
