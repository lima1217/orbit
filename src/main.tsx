import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// 离线可用：只在生产构建注册，避免开发时缓存干扰热更新
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready).then((reg) => {
      // 构建产物带 hash，把本次已加载的资源（含字体、播放过的环境音）交给 SW 缓存
      const urls = performance
        .getEntriesByType('resource')
        .map((e) => e.name)
        .filter((u) => u.startsWith(location.origin) || /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(u));
      reg.active?.postMessage({ type: 'CACHE_URLS', urls: [...new Set([location.origin + '/', ...urls])] });
    }).catch(() => undefined);
  });
}
