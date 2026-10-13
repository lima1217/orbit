/**
 * 逆旅 · Service Worker — 离线可用
 *
 * - 页面导航：网络优先，断网回退到缓存的首页
 * - 同源静态资源、字体：缓存优先并在后台刷新（stale-while-revalidate）
 * - 环境音：首次播放时缓存整份文件；<audio> 的 Range 请求从缓存切片返回 206
 *
 * 构建产物带 hash，无法在 install 时预知文件名：页面加载后会把已加载的资源清单
 * 通过 postMessage 发来，这里统一缓存（见 src/main.tsx）。
 * 修改本文件的缓存策略时，记得提升 CACHE 版本号。
 */

const CACHE = 'nilv-v2';
// 资源响应可能带 Vary: Origin（Vite 给脚本/样式加了 crossorigin），匹配时忽略，否则离线时对不上
const MATCH = { ignoreVary: true };
const SHELL = ['/', '/manifest.json', '/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// 页面发来的「已加载资源」清单
self.addEventListener('message', (event) => {
    if (event.data?.type !== 'CACHE_URLS') return;
    event.waitUntil(
        caches.open(CACHE).then((cache) =>
            Promise.all(
                event.data.urls.map(async (url) => {
                    if (await cache.match(url, MATCH)) return;
                    try {
                        const res = await fetch(url, { cache: 'no-cache' });
                        if (res.ok) await cache.put(url, res);
                    } catch {
                        // 离线或跨域失败：忽略，下次再来
                    }
                })
            )
        )
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);

    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }
    if (url.origin === self.location.origin && url.pathname.startsWith('/audio/')) {
        event.respondWith(audioFromCache(request));
        return;
    }
    if (url.origin === self.location.origin || FONT_HOSTS.includes(url.hostname)) {
        event.respondWith(staleWhileRevalidate(request));
    }
});

async function networkFirst(request) {
    const cache = await caches.open(CACHE);
    try {
        const res = await fetch(request);
        if (res.ok) cache.put('/', res.clone());
        return res;
    } catch {
        return (await cache.match('/', MATCH)) || Response.error();
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, MATCH);
    const network = fetch(request)
        .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
        })
        .catch(() => undefined);
    return cached || (await network) || Response.error();
}

/** 环境音：缓存整份文件，按 Range 头切片 */
async function audioFromCache(request) {
    const cache = await caches.open(CACHE);
    const key = new URL(request.url).pathname;
    let full = await cache.match(key, MATCH);
    if (!full) {
        try {
            const res = await fetch(key); // 不带 Range，取整份
            if (!res.ok || res.status !== 200) return res;
            await cache.put(key, res.clone());
            full = res;
        } catch {
            return Response.error();
        }
    }

    const buf = await full.arrayBuffer();
    const type = full.headers.get('Content-Type') || 'audio/mpeg';
    const total = buf.byteLength;
    const range = request.headers.get('Range');
    if (!range) {
        return new Response(buf, {
            status: 200,
            headers: { 'Content-Type': type, 'Content-Length': String(total), 'Accept-Ranges': 'bytes' },
        });
    }

    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? Number(m[1]) : 0;
    let end = m && m[2] ? Number(m[2]) : total - 1;
    if (m && !m[1] && m[2]) {
        start = total - Number(m[2]);
        end = total - 1;
    }
    end = Math.min(end, total - 1);
    const chunk = buf.slice(start, end + 1);
    return new Response(chunk, {
        status: 206,
        headers: {
            'Content-Type': type,
            'Content-Length': String(chunk.byteLength),
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
        },
    });
}
