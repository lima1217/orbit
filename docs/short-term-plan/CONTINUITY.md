# Orbit continuity ledger

## Goal

把 Orbit 做成「觉知工具」：课间几分钟，释放注意力，而不是抓住注意力。

成功标准：

1. 身体时区本身就是指引（不需要额外功能）
2. 每日有变化的内容，给用户回来的理由（诗意描述）
3. 首次体验的惊艳感能延续到日常使用

## Constraints

- 极简：做减法
- 身体时区已回答「我该什么时候做什么」
- 不做市面已有的冥想 App / 白噪音产品形态
- 不引入非必要新依赖

## Key decisions

### 2026-01-13：删除「日常活动」功能

用户洞察：看到 12:00 左右，自然知道该吃午饭。

备份：`docs/archive/life-events-feature/`

### 2026-01-13：删除设置面板

起床时间与城市已在主界面可达；设置页只是确认页。

备份：`docs/archive/settings-panel/`

后续补充：点击天体返回 Intro（非纯装饰）。

### 产品定位

- 是：课间几分钟，帮你看见身体时间后离开
- 不是：冥想 App、效率工具
- 差异：身体时区映射

### 品牌文案

Slogan：每个失眠的人都是流亡者，被放逐到错误的时区。

一句话：Orbit 帮你看到身体的时间，而非手表的时间。

## State

### Done

- 删除日常活动与设置面板
- Intro 环境音 + 全局音频延续到主界面
- 无缝循环（交叉淡入淡出 + 音频文件处理）
- 点击天体返回 Intro
- 音效 UI：无选中显示音符图标
- Cloudflare Pages：`https://orbittz.pages.dev`
- 2026-07-25：AGENTS.md / README 对照当前 `src/` 校正（结构、流程、`STANDARD_WAKEUP_HOUR=8`）
- 2026-07-25：移除未消费的 `TimeProvider`（每秒 tick 无订阅者）
- 2026-07-25：音频 Pivot — 删除未引用音源与 `seamless/`；在用轨压至 128kbps（`public/audio` 约 37MB → 7.3MB）

### Now

等待下一步产品/视觉指示。

### Next

- 主界面诗意文案是否再打磨（需先定文案方向）
- 视觉细节（需设计 brief，勿盲改）

## Working set

当前代码入口（勿引用已删除 hook）：

- `src/App.tsx`：阶段机与起床时间持久化
- `src/components/TimeZoneHome.tsx`、`WakeUpSheet.tsx`、`IntroSequence.tsx`、`SkyBackground.tsx`
- `src/hooks/useAmbientPlayer.ts`：React 封装
- `src/utils/globalAudio.ts`：实际播放与混音
- `src/constants/timezones.ts`、`ambientSounds.ts`、`cityPoetry.ts`
- `public/audio/`、`scripts/`（音频处理脚本如有）

## Archive

- `docs/archive/life-events-feature/`
- `docs/archive/settings-panel/`
