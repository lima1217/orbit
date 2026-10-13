# 逆旅 continuity ledger

记录目标、约束、关键取舍（含撤回的）与当前工作集。实现细节以 `AGENTS.md` 与 `src/` 为准，这里只记「为什么」。

## Goal

把逆旅（原名 Orbit）做成「觉知工具」：课间几分钟，释放注意力，而不是抓住注意力。

成功标准：

1. 身体时区本身就是指引（不需要额外功能）
2. 给用户每天回来的理由——现在由每日封面 + 校准、逆旅行程承担，而不是每天换文案
3. 首次体验的惊艳感能延续到日常使用

## Constraints

- 极简：做减法
- 身体时区已回答「我该什么时候做什么」
- 不做市面已有的冥想 App / 白噪音产品形态；不做推送提醒、睡眠评分、统计图表
- 不引入非必要新依赖（离线用手写 `sw.js`，没有引入 vite-plugin-pwa）

## Key decisions

### 2026-01-13：删除「日常活动」功能

用户洞察：看到 12:00 左右，自然知道该吃午饭。备份：`docs/archive/life-events-feature/`

### 2026-01-13：删除设置面板

起床时间与城市已在主界面可达；设置页只是确认页。备份：`docs/archive/settings-panel/`

### 2026-10-13：UI / 交互重构

- 首次流程改为「Intro → 全屏校准 → 揭晓」：原先先露出默认城市再弹表单，剧透了最有魔力的那一刻
- 核心视觉改为 24h 轨道表盘（`OrbitDial`），一天就是一圈轨道
- 天空全局常驻、按小时连续插值；后又做克制化：只用相邻色相、低彩度、夜晚雾蓝灰（原配色在一屏里放互补色，偏晃眼）
- 每屏只保留一处持续运动

### 2026-10-13：改名「逆旅」

出自苏轼「人生如逆旅，我亦是行人」：古义客舍，你是暂住各个时区的行人；今人读作「逆着走的旅程」，也切题。界面不再出现 Orbit；代码标识符与 `orbit_*` 存储键保留，避免丢用户数据。中文城市名升为主标题，与文楷词标同一气质。

### 2026-10-13：一句 Slogan，不轮换

曾改为每日轮换引用池（含苏轼一句），随后撤回：一句足够有力的话，胜过每天换一句。全站只用「每个失眠的人都是流亡者 / 被放逐到错误的时区」，引用池保留备用、不展示、不署出处。

### 2026-10-13：每日轻校准

作息不固定的人每天醒得不一样，时区应按天计算。每天第一次打开先翻开封面，再快速校准（预填昨天）。封面那一下轻触同时解决了「回访用户没有手势、浏览器不允许自动播放」的问题。

### 2026-10-13：新增四项功能

逆旅行程（只陈述不评判）、环境音定时淡出、离线（Service Worker）、分享卡片。分享会把用户往外推，与「看一眼就离开」有张力，入口因此放在顶栏角落、保持安静。

### 产品定位

- 是：课间几分钟，帮你看见身体时间后离开
- 不是：冥想 App、效率工具
- 差异：身体时区映射

### 品牌文案

- 名字：逆旅
- Slogan：每个失眠的人都是流亡者，被放逐到错误的时区
- 一句话：逆旅帮你看到身体的时间，而非手表的时间
- 生产网址：`https://orbit.aiwayfarer.net/`（Cloudflare Pages 项目域名 `https://orbittz.pages.dev`）

## State

### Done

- 2026-01：删除日常活动与设置面板；全局音频从 Intro 延续到主页；无缝循环音频
- 2026-07-25：文档对照代码校正；移除未消费的 `TimeProvider`；音频压到 128kbps（`public/audio` 约 37MB → 7.3MB）
- 2026-10-13：UI / 交互重构、改名逆旅、线性图标体系与 favicon / PWA 图标、配色克制化
- 2026-10-13：每日轻校准、逆旅行程、定时淡出、离线、分享卡片；修复回访用户「显示在播、实际静音」

### Now

等待下一步产品 / 视觉指示。

### Next / 待验证

- 真机验证：iOS 锁屏期间定时淡出能否准时（JS 计时器可能被暂停）；PWA 添加到主屏后的离线表现
- 主界面时段诗意文案是否再打磨（需先定文案方向）
- `text-title` / `text-body` / `text-picker-*` 与多数装饰色 token 已无组件使用，可择机清理

## Working set

- `src/App.tsx`：阶段机、每日校准判断、三个 Sheet
- `src/components/`：`IntroSequence`、`Calibration`、`TimeZoneHome`、`OrbitDial`、`WakeUpPicker`、`BottomSheet` 及各 Sheet、`InlineSoundSelector`
- `src/utils/`：`globalAudio`（播放状态订阅、定时淡出）、`journey`（起床记录）、`shareCard`
- `src/constants/`：`timezones`、`skyConfig`、`cityPoetry`、`dailyQuotes`、`ambientSounds`
- `public/sw.js`、`public/_headers`、`vercel.json`
- `scripts/generate-icons.sh` 与 `scripts/icons/`

## Archive

- `docs/archive/life-events-feature/`
- `docs/archive/settings-panel/`
