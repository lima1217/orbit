# 逆旅

> 每个失眠的人都是流亡者，被放逐到错误的时区。

逆旅是一款主观时间 Web 应用。一天仍是 24 小时，起点改成你的起床时刻：起床 = 你的日出（6:00）。你不是作息失序，你只是住在另一个时区。

名字出自苏轼「人生如逆旅，我亦是行人」。线上地址：[orbit.aiwayfarer.net](https://orbit.aiwayfarer.net/)。

## 它做什么

起床时间会映射成「生活时区」：相对标准起床（8:00）的偏差，叠上你的本地 UTC 偏移，再落到一张代表城市表上。北京（UTC+8）中午 12:00 起床，你此刻住在迪拜（UTC+4）。

- **今日封面与校准**：每天第一次打开，先看见封面，再确认今天几点醒（预填昨天，一下确认）。滚动时，城市与背后的天空一起变
- **轨道表盘**：一天是一圈轨道——左侧是你的日出，弧线是醒来后走过的路，光点是此刻
- **逆旅行程**：这些天你住过的城市，只陈述，不评判
- **环境音**：可叠加的白噪音，支持定时淡出
- **分享此刻**：把「此刻我住在哪」生成一张卡片
- **离线可用**：添加到主屏后，断网也能打开；播放过的声音会缓存

产品刻意不做提醒、评分与统计：时区映射本身就回答了「此刻该做什么」。看一眼，然后离开。

## 本地运行

需要 Node.js（建议 20.x）与 npm：

```bash
npm install
npm run dev
```

打开终端给出的本地地址（默认 `http://localhost:5173`）。首次进入会走封面与校准；轻触封面后才会开始环境音。

其它脚本见 `package.json`。两个不那么显然的：

- 离线（Service Worker）只在生产构建里启用，要测就 `npm run build && npm run preview`
- 改了应用图标的 SVG 母版后，运行 `bash scripts/generate-icons.sh` 重新生成 favicon 与 PWA 图标

### 调试参数

- `?first=true`：强制首次流程
- `?reset=true`：清除所有 `orbit_*` 本地数据，并去掉 URL 上的该参数

## 技术栈

React 19 + TypeScript · Vite 7 · Tailwind CSS 3 · Framer Motion 12。没有后端，数据只存在浏览器本地。

## 部署

构建命令 `npm run build`，输出目录 `dist/`。

| 目标 | 文档 |
|------|------|
| Cloudflare Pages（生产） | [CLOUDFLARE_PAGES.md](./docs/deployment/CLOUDFLARE_PAGES.md) |
| Vercel | [DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md) |

## 更多文档

| 文档 | 何时打开 |
|------|----------|
| [AGENTS.md](./AGENTS.md) | 改产品、视觉、时区逻辑、音效或离线策略前 |
| [CONTINUITY.md](./docs/short-term-plan/CONTINUITY.md) | 查近期决策、做过与撤回的取舍 |
| [docs/archive/](./docs/archive/) | 查已删除的「日常活动」「设置面板」方案 |
