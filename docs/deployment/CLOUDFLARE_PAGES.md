# Deploy 逆旅 on Cloudflare Pages

生产网址：`https://orbit.aiwayfarer.net/`。Pages 项目域名 `https://orbittz.pages.dev` 始终指向当前生产部署；预览部署会带 hash 子域。

## Why Cloudflare Pages

- 免费额度适合静态站
- 国内节点相对 Vercel 更稳
- 连上 Git 后，push 可自动部署

## CLI deploy

```bash
npm run build && npx wrangler pages deploy dist --project-name orbit-app
```

项目名以 Dashboard 里已有名为准（当前生产为 `orbittz` 一类命名时，以控制台显示为准）。

## Git 连接部署

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)，登录
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 授权并选择本仓库
4. 填写构建设置：

| 配置项 | 值 |
|--------|-----|
| Project name | 自定（生产现用 `orbittz` 对应域名） |
| Production branch | `main` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

目前不需要环境变量。保存并 Deploy。

## After deploy

你会得到 `https://<project-name>.pages.dev`（当前为 `https://orbittz.pages.dev`）。

自定义域名：项目设置 → **Custom domains** → 按提示改 DNS。对外生产网址是 `https://orbit.aiwayfarer.net/`；换域名时同步改 `src/utils/shareCard.ts` 的 `SITE`（分享卡片底部印的域名）。

## Service Worker

`public/_headers` 让 `/sw.js` 不被缓存（`Cache-Control: no-cache`），否则用户会卡在旧版 SW 上。它随 `public/` 一起复制进 `dist/`，无需额外配置。部署后在浏览器 DevTools → Application → Service Workers 确认 `sw.js` 已激活。

## Vs Vercel

| 项 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| 国内访问 | 常不稳定 | 相对稳定 |
| 免费带宽 | 有月配额 | 额度通常更大 |
| 免费构建 | 按分钟 | 按次数 |
| 全球 CDN | 有 | 有 |

细节以两家当前定价页为准。

## Troubleshooting

| 问题 | 做法 |
|------|------|
| 构建失败 | 看日志；设 `NODE_VERSION=20`；清依赖重装 |
| 手动重跑 | Dashboard → **Retry deployment** |
| 回滚 | **Deployments** → 选旧版本 → **Rollback** |

## Build reference

```text
Framework: Vite
Build command: npm run build
Output directory: dist
Node.js: 20.x
```

*对照仓库更新：2026-10-13*
