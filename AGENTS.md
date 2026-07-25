# Orbit：给代理与协作者的指南

Orbit 是一款主观时间应用：一天仍是 24 小时，但起点由你的起床时刻决定。起床 = Orbit 日出（6:00）。你不是作息失序，你只是住在另一个时区。

本文档描述产品意图、当前实现与开发约定。以 `src/` 为准；过时叙述以代码修正。

## 产品理念

受众是作息偏离「世俗节律」的人：日夜颠倒、睡眠长短不一、作息不固定。大众常称他们「失序」；Orbit 认为他们只是有自己的秩序。

一天的起点由身体决定，而非格林威治的钟声。凌晨三点睡、中午十一点醒，不是「不规律」，而是住在另一个时区。

### 时区映射

**起床时间 = Orbit 日出（6:00）**

生活时区由本地时区与起床相对「标准起床」的偏差算出（见 `STANDARD_WAKEUP_HOUR`，当前为 **8**）：

```text
livingOffset = localOffset - (wakeUpHour - STANDARD_WAKEUP_HOUR)
```

偏移再映射到代表城市（见 `src/constants/timezones.ts`）。例如北京（UTC+8）中午 12:00 起床 → 差 4 小时 → 生活时区 UTC+3（伊斯坦布尔）。

世界上真的有人在那个偏移迎接日出。这不是隐喻。

## 设计规范

风格：纪念碑谷式柔和 × 治愈系宇宙。明亮、留白、有机动效；避免暗黑、高对比刺眼色、机械化过渡。移动优先。

### 色彩（「晨曦星海」）

Token 定义在 `tailwind.config.js`，色值用 OKLCH。装饰色保持柔和；正文与控件用 `ink` / `*-ink`。

| 分类 | Token | 用途 |
|------|-------|------|
| 晨曦 | `dawn-cream`, `dawn-blush` | 背景、留白 |
| 天际 | `sky-mint`, `sky-aqua`, `sky-blue`, `sky-deep`, `sky-ink` | 天空渐变、天际墨色 |
| 樱瓣 | `blush-soft`, `blush-rose`, `blush-deep`, `blush-ink` | 粉色点缀 |
| 薰衣草 | `lavender-soft`, `lavender-deep`, `lavender-ink` | 淡紫点缀 |
| 灵魂金 | `soul-gold`, `soul-warm`, `soul-ink` | 太阳/高亮 |
| 墨色 | `ink-primary` … `ink-inverse` | 正文层级 |
| 操作 | `action`, `action-hover`, `action-fg` | 主按钮 |

`dream.*` 是 Intro 兼容别名，映射到同一套 token。

### 字体

- UI：`Inter`，中文回退 `PingFang SC` → `Hiragino Sans GB` → `Microsoft YaHei` → `Noto Sans SC`
- 诗意引用：`LXGW WenKai`（类名 `text-quote`）

语义层级定义在 `src/index.css`。同一场景只用一层；优先语义类，勿用散装 `text-2xl font-semibold` 替代。

| 层级 | 类名 | 用途 |
|------|------|------|
| Display | `text-display` | 巨大时间 |
| Brand | `text-brand` | 词标 Orbit |
| Headline | `text-headline` | 城市名、主标题 |
| Title | `text-title` | 面板标题 |
| Body | `text-body` | 正文 |
| Caption | `text-caption` / `text-caption-small` | 提示 |
| Overline | `text-overline` | 拉丁区块标签 |
| Button | `text-button` | 按钮 |
| Picker | `text-picker-selected` / `text-picker-option` | 选择器 |
| Quote | `text-quote` | 诗意文案 |

### 音效

默认首次混音含 **🧘 禅（`zen`）**（见 `useAmbientPlayer` / `globalAudio`）。偏好写入 `localStorage`（`orbit_sound_mix`）。

- Intro 触摸后开始播放；进入主界面不中断
- 无选中时 UI 显示音符图标；有选中时显示对应图标（可混音）
- `InlineSoundSelector`：点击展开，点外部收起
- 点击天空中的太阳/月亮可返回 Intro；音效不断

音源与目录：`src/constants/ambientSounds.ts`、`public/audio/`。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 7 |
| 样式 | Tailwind CSS 3 |
| 动画 | Framer Motion 12 |
| 规范 | ESLint |

## 项目结构

以当前 `src/` 为准：

```text
src/
├── App.tsx                      # 阶段机：intro / reveal / timezone / returning
├── main.tsx
├── index.css                    # 语义字体与全局样式
├── components/
│   ├── IntroSequence.tsx        # Landing：品牌 + 长按光晕进入
│   ├── TimeZoneHome.tsx         # 时区主页
│   ├── WakeUpSheet.tsx          # 起床时间底部表单
│   ├── SkyBackground.tsx        # 天空渐变与天体
│   ├── InlineSoundSelector.tsx  # 音效混音选择
│   └── icons/                   # SoundIcon、MokugyoIcon 等
├── constants/                   # 时区、天空、音效、文案、动画
├── core/                        # time-engine（及测试；未接入 UI）
├── hooks/                       # useAmbientPlayer
├── types/
└── utils/                       # globalAudio、audioUnlock
```

## 用户体验

三层界面，对应三个组件：

1. **Intro（`IntroSequence`）**：品牌与 Slogan；长按光晕进入。查询参数 `?first=true` 可强制首次流程。
2. **校准（`WakeUpSheet`）**：首次进入主页后强制打开，确认前不可关闭；之后可点「更改起床时间」再开。
3. **主页（`TimeZoneHome`）**：映射城市、诗意同步句、身体时间大字、音效选择、天空随小时变化。

### 主页展示什么

- 代表城市（emoji + 英文名）与城市诗意文案（`cityPoetry`）
- 映射时区的当前钟点（大字 Display）
- 天空渐变与太阳/月亮位置（`SkyBackground`）
- 音效选择器与底部「更改起床时间」

未实现（勿在文档或需求中当作已有）：地球时间轻触浮现、「距离日落/日出还有 X 时」、固定时区弹窗。

### 用户流程

| 场景 | 流程 |
|------|------|
| 首次 | Intro → reveal → 主页 + 强制 WakeUpSheet；确认后写入 `orbit_wakeup_time` |
| 回访（已保存起床时间） | 直达主页，跳过 Intro |
| 改起床时间 | 「更改起床时间」→ WakeUpSheet → 更新 localStorage 与城市 |
| 回 Intro | 点击太阳/月亮 → returning → Intro |
| 调试重置 | `?reset=true` 清除所有 `orbit_*` localStorage |

应用阶段（`App.tsx`）：`intro` | `reveal` | `timezone` | `returning`。

### 时间逻辑

- 起床时刻对齐 Orbit **6:00**（日出）
- 生活时区：`calculateLivingTimezone(wakeUpHour, localOffset)`，标准起床小时为 `STANDARD_WAKEUP_HOUR`（8）
- 主页大字显示的是映射城市在该 UTC 偏移下的本地钟点，随秒更新

## 常用命令

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

部署说明见 `docs/deployment/`。生产参考：Cloudflare Pages `https://orbittz.pages.dev`。

## 开发约定

**做：**

- 用「晨曦星海」与 `ink` / `action` token
- 保持明亮治愈、纪念碑谷式简约
- 函数组件 + Hooks；动效用 Framer Motion
- UI 方向变更前先对齐设计

**不做：**

- 深色/暗黑默认主题
- 刺眼纯色或高对比配色
- 简陋 MVP 式界面
- 生硬、机械化过渡
- 未确认设计就大改视觉

协作原则：质量优先于速度；讨论优先于实现；视觉在浏览器里验。

归档需求与旧方案：`docs/archive/`。短期连续性笔记：`docs/short-term-plan/CONTINUITY.md`。

*最后对照代码更新：2026-07-25*
