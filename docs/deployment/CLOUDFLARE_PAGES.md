# Cloudflare Pages 部署指南

> 给国内朋友的备用访问方案

## 🌐 已部署地址

**生产环境**: https://orbittz.pages.dev

> 每次部署会生成一个带 hash 的预览 URL（如 `9ac52b1c.orbittz.pages.dev`），
> 但主域名 `orbittz.pages.dev` 始终指向最新的生产部署。

---

## 为什么选择 Cloudflare Pages？

- ✅ **免费**：无限带宽、无限请求
- ✅ **国内友好**：Cloudflare 在国内有节点，比 Vercel 访问更稳定
- ✅ **自动部署**：连接 Git 仓库后，每次 push 自动部署

---

## 快速部署（CLI 方式）

```bash
# 构建并部署
npm run build && npx wrangler pages deploy dist --project-name orbit-app
```

### 2. 登录 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录或注册账号（免费）

### 3. 创建 Pages 项目

1. 左侧菜单点击 **"Workers & Pages"**
2. 点击 **"Create"** 按钮
3. 选择 **"Pages"** 标签页
4. 点击 **"Connect to Git"**

### 4. 连接 Git 仓库

1. 选择 **GitHub** 或 **GitLab**
2. 授权 Cloudflare 访问你的仓库
3. 选择 **Orbit** 仓库

### 5. 配置构建设置

填写以下信息：

| 配置项 | 值 |
|--------|-----|
| **Project name** | `orbit` （或其他你喜欢的名字） |
| **Production branch** | `main` |
| **Framework preset** | `Vite` （会自动识别） |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` （默认） |

### 6. 环境变量（如需要）

如果项目有环境变量，在 "Environment variables" 部分添加。

Orbit 目前不需要任何环境变量。

### 7. 点击 "Save and Deploy"

等待 1-2 分钟，部署完成！

---

## 部署成功后

你会获得一个免费域名：
```
https://orbit.pages.dev
```

或者自定义项目名：
```
https://your-project-name.pages.dev
```

### 添加自定义域名

1. 在项目设置中点击 **"Custom domains"**
2. 添加你的域名（如 `orbit.yourdomain.com`）
3. 按提示配置 DNS 记录

---

## 与 Vercel 对比

| 特性 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| 国内访问 | ❌ 经常被墙 | ✅ 相对稳定 |
| 免费带宽 | 100GB/月 | **无限** |
| 免费构建 | 6000分钟/月 | 500次/月 |
| 全球 CDN | ✅ | ✅ |

---

## 常见问题

### Q: 部署失败怎么办？

检查构建日志，常见问题：
1. Node 版本不兼容 → 在环境变量中设置 `NODE_VERSION=20`
2. 依赖安装失败 → 删除 `node_modules` 重试

### Q: 如何手动触发重新部署？

在 Cloudflare Dashboard 中点击 **"Retry deployment"**

### Q: 如何回滚到之前的版本？

在 **"Deployments"** 列表中找到之前的版本，点击 **"Rollback"**

---

## 构建配置参考

```
Framework: Vite
Build command: npm run build
Output directory: dist
Node.js version: 20.x (推荐)
```
