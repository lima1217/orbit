# Orbit

Orbit 是一款主观时间 Web 应用。一天仍是 24 小时，起点改成你的起床时刻：起床 = Orbit 日出（6:00）。你不是作息失序，你只是住在另一个时区。

本文说明产品在做什么、如何在本地跑起来、以及去哪里读更深的文档。线上可访问 [orbittz.pages.dev](https://orbittz.pages.dev)。

## What Orbit does

起床时间会映射成「生活时区」：相对标准起床小时的偏差，叠上你的本地 UTC 偏移，再落到一张代表城市表上。北京（UTC+8）中午 12:00 起床，会落到 UTC+3 一类城市（如伊斯坦布尔）。

主页显示该城市钟点、天空与诗意文案。身体时钟对齐后，产品刻意不做「下一顿饭 / 该睡了」类提醒：时区映射本身承担生活节奏指引。

你会经过三层界面：

1. **Intro**：品牌与 Slogan；长按光晕进入
2. **WakeUpSheet**：选今天几点起床（首次强制确认）
3. **TimeZoneHome**：城市、大字时间、天空、环境音；底部可 **更改起床时间**

点击太阳或月亮可回到 Intro；音效在页面间不中断。

## Run locally

需要本机已安装 Node.js（建议 20.x）与 npm。

安装依赖并启动开发服务器：

```bash
npm install
npm run dev
```

终端里打开 Vite 给出的本地地址（默认多为 `http://localhost:5173`）。浏览器首次进入会走 Intro；触摸后才会开始环境音。

其它脚本：

```bash
npm run build    # 产出到 dist/
npm run preview  # 预览生产构建
npm run lint
```

## Debug query params

开发或验收时可用查询参数：

- `?first=true`：强制首次 Intro 流程（忽略已保存的起床时间路由）
- `?reset=true`：清除所有 `orbit_*` localStorage，并清掉 URL 上的该参数

示例：`http://localhost:5173/?reset=true`

## Stack

| 层 | 选型 |
|------|------|
| UI | React 19 + TypeScript |
| 构建 | Vite 7 |
| 样式 | Tailwind CSS 3 |
| 动画 | Framer Motion 12 |
| 检查 | ESLint |

设计 token、字体层级与目录约定写在 [AGENTS.md](./AGENTS.md)。源码入口是 `src/App.tsx`；主界面在 `src/components/TimeZoneHome.tsx`。

## Deploy

| 目标 | 文档 |
|------|------|
| Vercel | [Deploy on Vercel](./docs/deployment/DEPLOYMENT.md) |
| Cloudflare Pages | [Deploy on Cloudflare Pages](./docs/deployment/CLOUDFLARE_PAGES.md)（生产：[orbittz.pages.dev](https://orbittz.pages.dev)） |

构建命令是 `npm run build`，输出目录是 `dist/`。

## More docs

| 文档 | 何时打开 |
|------|----------|
| [AGENTS.md](./AGENTS.md) | 改产品、视觉、时区逻辑或音效前 |
| [CONTINUITY.md](./docs/short-term-plan/CONTINUITY.md) | 查近期决策与当前工作集 |
| [docs/archive/](./docs/archive/) | 查已删除的「日常活动」「设置面板」方案 |

协作约定：质量优先于速度；重要 UI 变更前先对齐设计方向。
