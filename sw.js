const APP_VERSION = 'v8';
const CORE_CACHE = `moon-core-${APP_VERSION}`;
const MEDIA_CACHE = `moon-media-${APP_VERSION}`;
const DYNAMIC_CACHE = `moon-dynamic-${APP_VERSION}`;
const MAX_DYNAMIC_ITEMS = 150;

const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './assets/images/iconMoon.png',
    './assets/images/menuBG.png',
    './assets/images/mainmenu/storymode.png',
    './assets/images/mainmenu/freeplay.png',
    './assets/images/mainmenu/options.png',
    './assets/sounds/scrollMenu.ogg',
    './assets/sounds/confirmMenu.ogg',
    './source/funkin/Preferences.js',
    './source/funkin/Paths.js',
    './source/funkin/online/Online.js',
    './source/funkin/api/discord/DiscordLogin.js',
    './source/funkin/ui/community/CommunityMenu.js',
    './source/funkin/ui/options/OptionsState.js',
    './source/funkin/play/PlayState.js',
    './source/Main.js'
];

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(() => limitCacheSize(name, size));
            }
        });
    });
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((key) => {
                if (![CORE_CACHE, MEDIA_CACHE, DYNAMIC_CACHE].includes(key)) {
                    return caches.delete(key);
                }
            })
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) return;

    if (request.headers.has('range')) {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (!cachedResponse) return fetch(request);
                return cachedResponse.arrayBuffer().then(buffer => {
                    const rangeHeader = request.headers.get('range');
                    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
                    const start = parseInt(match[1], 10);
                    const end = match[2] ? parseInt(match[2], 10) : buffer.byteLength - 1;
                    const sliced = buffer.slice(start, end + 1);
                    return new Response(sliced, {
                        status: 206,
                        statusText: 'Partial Content',
                        headers: {
                            'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
                            'Content-Length': sliced.byteLength,
                            'Content-Type': cachedResponse.headers.get('content-type') || 'audio/ogg',
                            'Accept-Ranges': 'bytes'
                        }
                    });
                });
            }).catch(() => fetch(request))
        );
        return;
    }

    if (request.destination === 'image' || request.destination === 'audio' || url.pathname.endsWith('.ogg')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                return cached || fetch(request).then((res) => {
                    if (res && res.status === 200) {
                        const clone = res.clone();
                        caches.open(MEDIA_CACHE).then((cache) => cache.put(request, clone));
                    }
                    return res;
                });
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const networkPromise = fetch(request).then((res) => {
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, clone);
                        limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
                    });
                }
                return res;
            }).catch(() => {
                if (request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
            return cached || networkPromise;
        })
    );
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-moon-data') {
        event.waitUntil(Promise.resolve());
    }
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'MoonEngine', body: 'System Notification' };
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: './assets/images/iconMoon.png',
            badge: './assets/images/iconMoon.png',
            vibrate: [200, 100, 200]
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});

self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data.type === 'CLEAR_CACHES') {
        caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
    }
});
