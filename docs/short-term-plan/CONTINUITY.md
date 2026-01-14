# Orbit - Continuity Ledger

## Goal
让 Orbit 成为纯粹的"觉知工具"——课间5分钟，释放注意力而非抓住注意力

**成功标准**: 
1. ✅ 身体时区本身就是指引（不需要额外功能）
2. 每日有变化的内容，给用户回来的理由（诗意描述）
3. ✅ 首次体验的惊艳感能延续到日常使用

## Constraints/Assumptions
- 保持极简主义美学，做减法而非加法
- 身体时区本身已解决"我该什么时候做什么"的问题
- 不做别人已经做过的事（冥想 App、白噪音）
- 技术：不引入新依赖

## Key Decisions

### ✅ 2026-01-13: 删除"日常活动"功能
**用户洞察**: "当我看到12:00左右，我自然就知道该吃午饭了"
**备份位置**: `docs/archive/life-events-feature/`

### ✅ 2026-01-13: 删除设置面板
**原因**: 设置面板只是"确认页"，没有独特功能
- 起床时间 → 主界面底部按钮已可访问
- 身体时区 → 主界面已显示城市

**新行为**: 点击天体 → 纯装饰，无响应
**备份位置**: `docs/archive/settings-panel/`

### ✅ 产品定位确认
- **是什么**: 课间5分钟——帮用户快速获得清明后离开
- **不是什么**: 不是冥想 App，不是效率工具
- **核心差异**: 身体时区概念，市面上无直接竞品

### ✅ 品牌文案确认
**Slogan**: 
> "每个失眠的人都是流亡者——被放逐到错误的时区。"

**产品一句话**: 
> "Orbit 帮你看到身体的时间，而非手表的时间。"

## State
### Done
- ✅ 删除"日常活动"功能
- ✅ 删除设置面板（简化为纯界面）
- ✅ 确定产品定位和品牌文案
- ✅ 构建验证通过
- ✅ Intro 动画添加舒适白噪音（粉噪音）
- ✅ **修复音频循环断裂感** — 双管齐下：
  - 代码层：双缓冲交叉淡入淡出
  - 文件层：音频首尾余弦曲线淡入淡出
- ✅ **点击天体返回 Intro** — 点击太阳/月亮可返回梦幻 Intro 界面
- ✅ **音效延续规则** — Intro 页使用全局音效系统，音效从第一页延续到第二页
- ✅ **UI 优化** — 无音效时显示 🎵 图标，不显示"选择音效"文字
- ✅ **文档更新** — AGENTS.md 添加音效规范章节
- ✅ **Cloudflare Pages 部署** — 已成功部署至 https://orbittz.pages.dev

### Now
- 等待用户下一步指示

### Next
- 主界面文案优化（两行诗意描述是否需要调整）
- 继续打磨视觉细节
- 将 WAV 转回 MP3 以减小文件大小（生产环境）

## Working Set
- `src/hooks/useSmartSound.ts` — 智能音效 Hook（已升级为双缓冲无缝循环）
- `src/hooks/useAmbientSound.ts` — 环境音效 Hook（已升级为双缓冲无缝循环）
- `src/hooks/useSeamlessLoop.ts` — 独立的无缝循环 Hook（可复用）
- `public/audio/seamless/` — 处理过的无缝循环音频文件
- `scripts/process-audio-seamless.mjs` — 音频处理脚本

## Archive
- `docs/archive/life-events-feature/` — 日常活动功能
- `docs/archive/settings-panel/` — 设置面板


