# Orbit 部署指南

> 最后更新: 2026-01-14

## 🚀 快速部署 (Vercel)

### 首次部署

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "🚀 Initial commit"
   git remote add origin https://github.com/<你的用户名>/orbit.git
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 用 GitHub 登录
   - Import `orbit` 仓库
   - 点击 Deploy

3. **获得线上地址**
   - 默认: `orbit-xxx.vercel.app`
   - 可自定义域名

### 更新部署

每次更新只需要：

```bash
git add .
git commit -m "✨ 你的更新描述"
git push
```

Vercel 会**自动检测并重新部署**，约 1-2 分钟后上线。

---

## 🌍 全球访问优化

### 当前状态
- **海外用户**: Vercel CDN，速度极快 ✅
- **国内用户**: 可访问但稍慢 ⚠️

### 进阶优化 (可选)

#### 方案 A: Cloudflare 加速
1. 购买域名 (如 `theorbit.app`)
2. 将域名托管到 Cloudflare (免费)
3. 在 Vercel 添加自定义域名
4. 开启 Cloudflare Proxy

#### 方案 B: 国内镜像 (需备案)
如用户量增长，可考虑：
- 腾讯云 Webify
- 阿里云 OSS + CDN
- 需要 ICP 备案

---

## 📦 构建信息

```
Framework: Vite 7
Build Command: npm run build
Output Directory: dist
Node Version: 20.x
```

### 构建产物
```
dist/
├── index.html          (~0.5 KB)
├── assets/
│   ├── index-xxx.css   (~37 KB, gzip ~7 KB)
│   └── index-xxx.js    (~355 KB, gzip ~114 KB)
└── audio/              (音频文件)
```

---

## 🔧 配置文件

### vercel.json
- SPA 路由 fallback (所有路由 → index.html)
- 静态资源缓存优化

### 环境变量 (如需要)
在 Vercel Dashboard → Settings → Environment Variables 添加

---

## 📊 监控与分析 (可选)

### Vercel Analytics (免费)
在 Vercel Dashboard 开启即可查看：
- 访问量
- 加载性能
- 用户地理分布

### 其他推荐
- [Umami](https://umami.is/) - 隐私友好的开源分析
- [Plausible](https://plausible.io/) - 简洁轻量

---

## 🆘 常见问题

### Q: 国内访问慢怎么办？
A: 先用 Cloudflare 优化，如仍不够再考虑国内镜像

### Q: 如何回滚到之前版本？
A: Vercel Dashboard → Deployments → 选择之前的版本 → Promote to Production

### Q: 如何预览 PR 变更？
A: Vercel 自动为每个 PR 创建 Preview 部署

---

## 📅 部署检查清单

上线前确认：

- [ ] `npm run build` 成功
- [ ] `npm run preview` 本地预览正常
- [ ] 音频文件体积优化 (MP3 vs WAV)
- [ ] 移动端体验测试
- [ ] 不同时区测试
