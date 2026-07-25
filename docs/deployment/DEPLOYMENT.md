# Deploy Orbit on Vercel

把 Orbit 静态站部署到 Vercel。构建命令是 `npm run build`，输出目录是 `dist/`，建议 Node 20.x。

## First deploy

1. 把仓库推到 GitHub（已有 remote 则跳过 `git init`）
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录，Import 本仓库，Deploy
3. 得到默认地址 `orbit-xxx.vercel.app`；需要时再绑自定义域名

## Update deploy

```bash
git add .
git commit -m "描述这次变更"
git push
```

Vercel 在 push 后自动重新部署。

## Access notes

- 海外：走 Vercel CDN，通常可用
- 国内：可能偏慢；可改走 Cloudflare Pages（见 [CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md)），或域名经 Cloudflare 代理后再指到 Vercel

国内镜像（腾讯云 Webify、阿里云 OSS + CDN）通常需要 ICP 备案，量大再考虑。

## Build

```text
Framework: Vite 7
Build command: npm run build
Output directory: dist
Node: 20.x
```

产物大致包括：

```text
dist/
├── index.html
├── assets/          # CSS / JS
└── audio/           # 环境音
```

具体体积随构建变化，以本地 `npm run build` 为准。

## Config

`vercel.json`：SPA fallback（路由进 `index.html`）、静态缓存。当前应用不依赖环境变量；若以后需要，在 Vercel → Settings → Environment Variables 添加。

## Monitoring (optional)

Vercel Analytics 可看访问量、性能与地理分布。第三方可选 [Umami](https://umami.is/)、[Plausible](https://plausible.io/)。

## Troubleshooting

| 问题 | 做法 |
|------|------|
| 国内偏慢 | 先试 Cloudflare Pages 或 CF 代理；仍不够再考虑国内镜像 |
| 回滚 | Vercel → Deployments → 选旧版本 → Promote to Production |
| 预览 PR | Vercel 为每个 PR 建 Preview 部署 |

## Checklist before ship

- [ ] `npm run build` 成功
- [ ] `npm run preview` 本地预览正常
- [ ] 音频体积可接受（优先 MP3）
- [ ] 移动端过一遍
- [ ] 换几个本地时区/起床时间验城市映射

*对照仓库更新：2026-07-25*
