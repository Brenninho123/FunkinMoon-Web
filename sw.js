const APP_VERSION = 'v11';
const CACHE_NAMES = {
    core: `moon-core-${APP_VERSION}`,
    media: `moon-media-${APP_VERSION}`,
    dynamic: `moon-dynamic-${APP_VERSION}`,
    songs: `moon-songs-${APP_VERSION}`
};

const MAX_CACHE_ENTRIES = {
    dynamic: 250,
    media: 300,
    songs: 100
};

const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './project.js',
    './assets/images/iconMoon.png',
    './assets/images/menuBG.png',
    './assets/images/mainmenu/storymode.png',
    './assets/images/mainmenu/freeplay.png',
    './assets/images/mainmenu/options.png',
    './assets/sounds/scrollMenu.ogg',
    './assets/sounds/confirmMenu.ogg',
    './assets/sounds/cancelMenu.ogg',
    './source/funkin/Version.js',
    './source/funkin/Preferences.js',
    './source/funkin/save/Save.js',
    './source/funkin/Paths.js',
    './source/funkin/data/Data.js',
    './source/funkin/online/Online.js',
    './source/funkin/api/discord/DiscordLogin.js',
    './source/funkin/api/youtube/YoutubeChannels.js',
    './source/funkin/ui/community/CommunityMenu.js',
    './source/funkin/ui/options/OptionsState.js',
    './source/funkin/ui/debug/FunkinDebugDisplay.js',
    './source/funkin/ui/freeplay/FreeplayState.js',
    './source/funkin/play/PlayState.js',
    './source/Main.js'
];

const pruneCache = async (cacheName, maxItems) => {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        await cache.delete(keys[0]);
        await pruneCache(cacheName, maxItems);
    }
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAMES.core).then((cache) => cache.addAll(CORE_ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    const allowedCaches = Object.values(CACHE_NAMES);
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((key) => {
                if (!allowedCaches.includes(key)) {
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
        event.respondWith(handleRangeRequest(request));
        return;
    }

    if (url.pathname.includes('/assets/songs/')) {
        event.respondWith(handleSongAssets(request));
        return;
    }

    if (request.destination === 'image' || request.destination === 'audio' || url.pathname.endsWith('.ogg')) {
        event.respondWith(handleMediaAssets(request));
        return;
    }

    if (url.pathname.endsWith('.json') || url.pathname.endsWith('.xml') || url.pathname.endsWith('.lua')) {
        event.respondWith(handleNetworkFirstData(request));
        return;
    }

    event.respondWith(handleStaleWhileRevalidate(request));
});

async function handleRangeRequest(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        const buffer = await cachedResponse.arrayBuffer();
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
    }
    return fetch(request);
}

async function handleSongAssets(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const res = await fetch(request);
        if (res && res.status === 200) {
            const cache = await caches.open(CACHE_NAMES.songs);
            cache.put(request, res.clone());
            pruneCache(CACHE_NAMES.songs, MAX_CACHE_ENTRIES.songs);
        }
        return res;
    } catch (e) {
        return cached;
    }
}

async function handleMediaAssets(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const res = await fetch(request);
        if (res && res.status === 200) {
            const cache = await caches.open(CACHE_NAMES.media);
            cache.put(request, res.clone());
            pruneCache(CACHE_NAMES.media, MAX_CACHE_ENTRIES.media);
        }
        return res;
    } catch (e) {
        return cached;
    }
}

async function handleNetworkFirstData(request) {
    try {
        const networkRes = await fetch(request);
        if (networkRes && networkRes.status === 200) {
            const cache = await caches.open(CACHE_NAMES.dynamic);
            cache.put(request, networkRes.clone());
            pruneCache(CACHE_NAMES.dynamic, MAX_CACHE_ENTRIES.dynamic);
        }
        return networkRes;
    } catch (e) {
        const cached = await caches.match(request);
        if (cached) return cached;
    }
}

async function handleStaleWhileRevalidate(request) {
    const cached = await caches.match(request);
    const networkPromise = fetch(request).then(async (res) => {
        if (res && res.status === 200) {
            const cache = await caches.open(CACHE_NAMES.core);
            cache.put(request, res.clone());
        }
        return res;
    }).catch(() => {
        if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
        }
    });

    return cached || networkPromise;
}

self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data.type === 'CLEAR_CACHES') {
        caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
    }
});
