# 逆旅：给代理与协作者的指南

逆旅（原名 Orbit）是一款主观时间应用：一天仍是 24 小时，但起点由你的起床时刻决定。起床 = 你的日出（6:00）。你不是作息失序，你只是住在另一个时区。

本文档描述产品意图、当前实现与开发约定。以 `src/` 为准；文档与代码不符时以代码修正文档。

## 产品理念

受众是作息偏离「世俗节律」的人：日夜颠倒、睡眠长短不一、作息不固定。大众常称他们「失序」；逆旅认为他们只是有自己的秩序。

一天的起点由身体决定，而非格林威治的钟声。凌晨三点睡、中午十一点醒，不是「不规律」，而是住在另一个时区。

定位：课间几分钟看一眼身体时间，然后离开——释放注意力，而不是抓住注意力。身体时区本身就回答了「此刻该做什么」，所以不做提醒、评分、冥想课程这类功能（取舍记录见 `docs/short-term-plan/CONTINUITY.md`）。

### 品牌

- 中文名「逆旅」，出自苏轼「人生如逆旅，我亦是行人」：你是在各个时区之间暂住的行人
- 核心 Slogan：「每个失眠的人都是流亡者 / 被放逐到错误的时区」——全站只用这一句（`getDailyQuote()` 始终返回它）；`DAILY_QUOTES` 引用池保留备用，不展示
- 界面上不出现 Orbit。代码标识符（`OrbitDial` 等）与 `orbit_*` 存储键保留——改键会让已有用户丢失数据

### 时区映射

生活时区由本地时区与起床相对「标准起床」的偏差算出（`STANDARD_WAKEUP_HOUR` = **8**）：

```text
livingOffset = localOffset - (wakeUpHour - STANDARD_WAKEUP_HOUR)
```

偏移再映射到代表城市（`src/constants/timezones.ts`）。例如北京（UTC+8）中午 12:00 起床 → 晚 4 小时 → UTC+4（迪拜）。世界上真的有人在那个偏移迎接日出，这不是隐喻。

「一天」以起床为起点：距上次起床满 20 小时，就视为新的一天（`utils/journey.needsDailyCheckIn`）。

## 用户体验

所有页面共用 App 层的一片天空（`SkyBackground`），切页只换内容，世界连续。应用阶段（`App.tsx`）：`intro` | `calibrate` | `home`，由 `AnimatePresence` 交叉淡出。

1. **Intro / 今日封面（`IntroSequence`）**：一条轨道 + 绕行小太阳；轨道内为词标「逆旅」与 Slogan。轻触进入——这一下同时是开启音频的手势
2. **校准（`Calibration`）**：在揭晓城市**之前**全屏询问起床时间；滚动时城市名与背后天空实时变化。首次访问与每天第一次打开都经过这里（每日版预填昨天的时间，一下确认）
3. **主页（`TimeZoneHome`）**：顶栏左「分享」、中词标、右「行程」；城市 + 轨道表盘 + 时段诗意；底部左「醒于 HH:MM」、右环境音

### 用户流程

| 场景 | 流程 |
|------|------|
| 首次 | Intro → 校准 → 主页揭晓 |
| 每天第一次打开 | 今日封面 → 校准（预填昨天）→ 主页；页面挂着隔天切回来也会重新翻开封面 |
| 当天再次打开 | 直达主页；没有手势，环境音显示「轻触播放」，轻触任意处开始播放 |
| 改起床时间 | 「醒于 HH:MM」→ `WakeUpSheet`（天空实时预览）→ 更新今天的记录与城市 |
| 回 Intro | 点击顶部词标「逆旅」 |
| 调试 | `?first=true` 强制首次流程；`?reset=true` 清除所有 `orbit_*` |

### 主页展示什么

- 「此刻你住在」+ 中文城市名（文楷主标题）+ 英文名（衬线斜体）· UTC 偏移；超过 6 字的译名自动降一档保持单行
- `OrbitDial`：正午在顶、午夜在底；左侧 06:00 为起床（日出）点，渐变弧是醒来以来的轨迹，光点（日 / 月）是此刻
- 轨道中心：时段标签（`getDayPhase`）+ 身体时间大字 +「手表 HH:MM · 早 / 晚 N 小时」
- 表盘下一句时段诗意（`cityPoetry`）
- 「分享」→ `ShareSheet`：Canvas 生成 3:4 卡片（`utils/shareCard`：城市、轨道、身体时间、Slogan、生产域名）；移动端走系统分享，桌面保存图片
- 「行程」→ `JourneySheet`：最近 14 天住过的城市，只陈述、不评判——没有分数与统计图

未实现（勿当作已有）：「距离日落 / 日出还有 X 时」、固定时区弹窗。

### 环境音

- 混音：可叠加多种；默认 `zen`。音源与目录：`src/constants/ambientSounds.ts`、`public/audio/`
- 浏览器只允许在用户手势里开始播放。`useAmbientPlayer().isPlaying` 读的是**真实**播放状态（`globalAudio.subscribeAudio`），UI 据此显示「轻触播放」，不会显示在播、实际静音
- `InlineSoundSelector`：主页右下角，点击向上展开（图标 + 名称），点外部 / Esc 收起；无选中时显示静音扬声器 +「静音」
- 定时淡出：面板底部「关 / 15′ / 30′ / 60′」，到点 8 秒淡出后停止，保留选择。后台标签页的计时器可能被推迟，回到前台若已过点立即补执行；iOS 锁屏期间能否准时未经真机验证
- 切页、回 Intro 时音效不断

### 本地存储

全部只存本地，键名都以 `orbit_` 开头：

| 键 | 内容 |
|----|------|
| `orbit_wakeup_time` | 最近一次起床时间 `H:M` |
| `orbit_last_wake` | 最近一次起床时刻（ISO），判断是否新的一天 |
| `orbit_journey` | 行程：每天一条 `{date, hour, minute, offset, city, cityCN}`，最多 90 条 |
| `orbit_sound_mix` | 选中的环境音 id 数组 |
| `orbit_first_sound_played` | 首次播放标记 |

## 设计规范

风格：纪念碑谷式柔和 × 治愈系宇宙。明亮、留白、克制；移动优先。

### 色彩

- 正文与控件：`ink-primary` … `ink-inverse`、`action` / `action-hover` / `action-fg`（`tailwind.config.js`，OKLCH）。这是组件里唯一常用的 Tailwind 色彩 token；`dawn` / `sky` / `blush` / `lavender` / `soul` / `dream` 仍在配置里，组件基本未用
- 天空：`src/constants/skyConfig.ts` 的 24 小时关键帧，按小时连续插值。原则——同一时段只用相邻色相（不在一屏放蓝 ↔ 杏这类互补对）；整屏 chroma ≤ 0.03，下半屏趋近纸白；太阳光晕 alpha 约 0.38；夜色是明亮的雾蓝灰；叠一层静态纸纹
- 表盘轨迹、太阳等点缀色写在组件内（`OrbitDial`），分享卡片复用同一组值（`utils/color` 把 OKLCH 转成 Canvas 可用的 rgba）

### 字体

| 字体 | 用途 |
|------|------|
| `LXGW WenKai`（`text-quote`、`font-quote`） | 词标「逆旅」、中文城市名、诗意文案 |
| `Instrument Serif`（`font-serif`） | 拉丁城市名（斜体）。它只有旧式数字，**数字一律用 Inter** |
| `Inter` | UI、身体时间（ExtraLight 200）、滚轮数字 |

语义层级在 `src/index.css`，优先用语义类：

| 类名 | 用途 |
|------|------|
| `text-display` | 轨道中心的身体时间 |
| `text-brand` | Intro 词标「逆旅」（文楷，宽字距） |
| `text-wordmark` | 主页顶部小词标 |
| `text-headline` | 中文城市名（文楷） |
| `text-quote` | 诗意文案、Slogan、面板标题 |
| `text-overline` | 区块小标签（如「此刻你住在」） |
| `text-caption` / `text-caption-small` | 提示与次要信息 |
| `text-button` | 按钮 |

中文不加字距；唯一例外是词标「逆旅」。（`text-title`、`text-body`、`text-picker-*` 仍定义在 CSS 里，当前未使用。）

### 图标

所有图标经由 `src/components/icons/LineIcon.tsx` 的 `LineIcon` 外壳渲染：24 网格 · 1.5 描边 · 圆端圆角 · `currentColor`，只有极小的点（眼睛、星）用实心。环境音图标在 `SoundIcon.tsx`，UI 图标（日出、静音、播放、分享、行程）在 `LineIcon.tsx`。新图标照此外壳画，不用 emoji。

应用图标（favicon / PWA）：标志是 Intro 的「轨道 + 太阳」，不放「逆旅」二字（小尺寸会糊，渲染环境也没有文楷）。改图标只改 `scripts/icons/*.svg`，再跑 `bash scripts/generate-icons.sh`（需 Chrome + ImageMagick）。`icon-full.svg` 是满版母版（元素在 maskable 安全圆内），`icon-small.svg` 是加粗简化版。

### 动效

每屏只保留一处持续运动：Intro 是绕行的太阳，主页是表盘光点的呼吸。其余元素只在进场时动一次。

## 项目结构

```text
src/
├── App.tsx                      # 阶段机 intro / calibrate / home；全局天空；三个 Sheet
├── main.tsx                     # 入口；生产构建注册 Service Worker
├── index.css                    # 语义字体与全局样式
├── components/
│   ├── IntroSequence.tsx        # Intro / 今日封面
│   ├── Calibration.tsx          # 全屏校准（首次 / 每日）
│   ├── TimeZoneHome.tsx         # 主页
│   ├── OrbitDial.tsx            # 24h 轨道表盘
│   ├── WakeUpPicker.tsx         # 问题 + 滚轮 + 实时城市预览（校准与 Sheet 共用）
│   ├── TimeWheel.tsx            # 时 : 分 滚轮
│   ├── BottomSheet.tsx          # 通用底部 Sheet（焦点圈定 / Esc / 下拉关闭）
│   ├── WakeUpSheet.tsx / JourneySheet.tsx / ShareSheet.tsx
│   ├── SkyBackground.tsx        # 天空、天体光晕、夜间星点、纸纹
│   ├── InlineSoundSelector.tsx  # 环境音混音与定时淡出
│   └── icons/                   # LineIcon 外壳与全部线性图标
├── constants/                   # 时区、天空、音效、文案（Slogan / 时段诗意）、动画
├── core/                        # time-engine（及测试；未接入 UI）
├── hooks/                       # useAmbientPlayer、useNow
├── types/
└── utils/                       # globalAudio、audioUnlock、journey、shareCard、color
public/sw.js                     # Service Worker
scripts/                         # generate-icons.sh 与图标母版、音频处理脚本
```

## 离线与部署

- 生产网址：`https://orbit.aiwayfarer.net/`（分享卡片底部印的也是它，见 `utils/shareCard.ts` 的 `SITE`）。Cloudflare Pages 项目域名：`https://orbittz.pages.dev`。部署步骤见 `docs/deployment/`
- `public/sw.js`：页面导航网络优先、断网回退缓存；静态资源与字体 stale-while-revalidate；环境音首次播放时整份缓存，`<audio>` 的 Range 请求从缓存切片返回 206。构建产物带 hash，页面加载后把已加载资源清单 `postMessage` 给 SW 缓存
- 匹配缓存必须带 `ignoreVary`：Vite 给脚本 / 样式加了 `crossorigin`，响应带 `Vary: Origin`，不忽略的话离线时对不上，页面空白
- 改 `sw.js` 的缓存策略时提升 `CACHE` 版本号。`/sw.js` 在 `public/_headers`（Cloudflare）与 `vercel.json` 里都设为不缓存
- 开发服务器不注册 SW；测离线用 `npm run build && npm run preview`，再停掉服务器刷新

## 开发约定

- 用 `ink` / `action` token 与语义字体类；天空色改 `skyConfig` 关键帧
- 保持明亮治愈、留白克制；夜晚也是明亮的
- 函数组件 + Hooks；动效用 Framer Motion，且遵守「每屏一处持续运动」
- UI 方向变更前先对齐设计；视觉在浏览器里验（移动视口优先）
- 质量优先于速度；讨论优先于实现

明确不做：深色 / 暗黑默认主题；刺眼纯色或高对比配色；简陋 MVP 式界面；生硬、机械化过渡；未确认设计就大改视觉。

归档需求与旧方案：`docs/archive/`。近期决策与连续性：`docs/short-term-plan/CONTINUITY.md`。

*最后对照代码更新：2026-10-13*
