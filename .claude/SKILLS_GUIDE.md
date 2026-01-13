# Skills 机制应用指南

> 如何在多项目环境中使用 Claude Skills 和 Antigravity Workflows

---

## 📚 核心概念

### Claude Skills（知识库）
- **定位**: AI 的专业知识库，类似于"培训手册"
- **格式**: Markdown 文档（SKILL.md）
- **触发**: AI 自动识别何时需要使用
- **内容**: 概念、模板、最佳实践、代码示例

### Antigravity Workflows（操作手册）
- **定位**: 明确的执行步骤，类似于"操作指南"
- **格式**: Markdown 文档（.md）
- **触发**: 用户显式调用（如 `/new-react-project`）
- **内容**: 具体命令、文件操作、决策点

---

## 🎯 实际应用场景

### 场景 1: 创建新项目

**用户说**: "帮我创建一个新的 React 项目"

**系统响应**:
1. **Workflow 被触发**: `/new-react-project` 开始执行
2. **Skill 被引用**: AI 查阅 `project-init` skill 获取模板
3. **结果**: 创建标准化的项目结构，使用预定义的配置

```
用户请求 → Workflow 执行 → Skill 提供知识 → 输出结果
```

---

### 场景 2: 开发过程中的技术问题

**用户说**: "如何在 React 中实现一个持久化的时间选择器？"

**系统响应**:
1. **Skill 自动应用**: AI 查阅 `react-patterns` 和 `time-ui-patterns` skills
2. **提供方案**: 结合两个 skill 的知识，给出完整实现
3. **代码生成**: 使用 skill 中的模板生成代码

```
技术问题 → Skills 自动匹配 → 提供专业建议 → 生成代码
```

---

## 🏗️ 项目目录结构

```
Orbit/                          # 你的主项目
├── .agent/
│   └── workflows/              # Antigravity Workflows
│       ├── new-react-project.md
│       └── ui-ux-pro-max.md
├── .claude/
│   └── skills/                 # Claude Skills
│       ├── .claude-plugin/
│       │   └── plugin.json     # Skills 配置
│       ├── react-patterns/
│       │   └── SKILL.md        # React 开发模式
│       ├── time-ui-patterns/
│       │   └── SKILL.md        # 时间 UI 专业知识
│       └── project-init/
│           └── SKILL.md        # 项目初始化模板
├── src/
└── package.json
```

---

## 🔄 Skills 和 Workflows 的协同工作

### 示例：完整的开发流程

```mermaid
用户: "创建一个新的时间追踪应用"
   ↓
Workflow: /new-react-project 执行
   ├── Step 1: 创建 Vite 项目
   ├── Step 2: 安装依赖（查询 project-init skill）
   ├── Step 3: 创建目录结构（查询 project-init skill）
   └── Step 4: 初始化配置文件
   ↓
用户: "添加一个时区选择器组件"
   ↓
Skills 自动应用:
   ├── react-patterns skill → 提供组件结构模板
   ├── time-ui-patterns skill → 提供时区计算逻辑
   └── 生成符合最佳实践的代码
   ↓
完成！
```

---

## 📖 已创建的 Skills 说明

### 1. `react-patterns` - React 开发模式
**包含内容**:
- Context API 使用模式
- 自定义 Hook 模板（如 useLocalStorage）
- Framer Motion 动画标准
- TypeScript 最佳实践
- 项目文件结构

**何时使用**:
- 创建新 React 组件
- 实现状态管理
- 添加动画效果
- 处理 TypeScript 类型问题

---

### 2. `time-ui-patterns` - 时间 UI 专业知识
**包含内容**:
- Living Timezone 概念实现
- 时区计算函数
- 日出/日落时间获取
- 相对时间显示
- Orbit Hour 系统（24小时可视化）
- 时间选择器 UI 模式

**何时使用**:
- 构建时间相关功能
- 实现自定义时区逻辑
- 显示相对时间（"3小时后"）
- 可视化时间轴或日程

---

### 3. `project-init` - 项目初始化模板
**包含内容**:
- Vite + React + TypeScript 模板
- 推荐依赖包清单
- 标准项目结构
- tsconfig.json 配置
- CSS Reset 和设计系统
- .gitignore 模板

**何时使用**:
- 创建新项目
- 标准化项目配置
- 设置开发环境

---

## 🎨 如何为其他项目创建 Skills

### 以 "Skills抓取器" 项目为例

假设这是一个数据抓取项目，你可以创建：

**`/Desktop/Skills抓取器/.claude/skills/web-scraping/SKILL.md`**

```markdown
# Web Scraping Patterns

## Overview
Best practices for web scraping and data extraction.

## Puppeteer Pattern
\`\`\`typescript
import puppeteer from 'puppeteer';

async function scrapeGitHub(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  const data = await page.evaluate(() => {
    // Extraction logic
  });
  
  await browser.close();
  return data;
}
\`\`\`

## Rate Limiting
Always implement rate limiting to be respectful...
```

---

## 💡 最佳实践

### ✅ 好的 Skill 设计
- **具体**: 聚焦特定技术领域（如 "React Hooks" 而非 "Frontend"）
- **实用**: 包含可直接使用的代码模板
- **清晰**: 明确说明何时使用该 skill
- **示例**: 提供真实的使用案例

### ✅ 好的 Workflow 设计
- **明确步骤**: 每个步骤清晰可执行
- **自动化**: 使用 `// turbo` 标记安全的自动执行步骤
- **交互点**: 在需要用户决策时明确提示
- **可维护**: 步骤不要太细碎，保持合理粒度

---

## 🚀 快速开始

### 测试你的 Skills 系统

1. **重启 Antigravity** 使 skills 生效

2. **测试自动应用**:
   - 说："如何实现 localStorage 持久化？"
   - AI 应该自动引用 `react-patterns` skill 中的 useLocalStorage

3. **测试 Workflow**:
   - 运行：`/new-react-project`
   - 应该按步骤执行项目创建流程

4. **创建自定义 Skill**:
   - 为你的其他项目创建专属 skill
   - 放在对应项目的 `.claude/skills/` 目录

---

## 📦 跨项目共享 Skills

如果多个项目需要相同的 skills：

### 方法 1: 符号链接（推荐）
```bash
# 创建共享 skills 目录
mkdir -p ~/shared-claude-skills

# 在每个项目中创建符号链接
ln -s ~/shared-claude-skills /Users/zhangwei/Desktop/Orbit/.claude/skills/shared
ln -s ~/shared-claude-skills /Users/zhangwei/Desktop/Skills抓取器/.claude/skills/shared
```

### 方法 2: Git Submodule
```bash
# 将 skills 作为独立 repo
git init ~/claude-skills-library
cd ~/claude-skills-library
git add .
git commit -m "Initial skills library"

# 在项目中添加为 submodule
cd /Users/zhangwei/Desktop/Orbit
git submodule add ~/claude-skills-library .claude/skills/library
```

---

## 🎯 总结

| 特性 | Claude Skills | Antigravity Workflows |
|------|---------------|----------------------|
| **本质** | 知识库 | 操作手册 |
| **触发** | AI 自动识别 | 用户显式调用 |
| **格式** | 概念 + 模板 | 命令 + 步骤 |
| **适用** | 技术深度知识 | 重复性任务 |
| **位置** | `.claude/skills/` | `.agent/workflows/` |

**最佳实践**: Skills 提供"如何做"的知识，Workflows 提供"做什么"的步骤。两者结合使用才能发挥最大效能！

---

## ❓ 常见问题

**Q: 我需要为每个项目都创建 skills 吗？**
A: 不需要。通用的技术 skills（如 React、TypeScript）可以共享。只为项目特有的领域知识创建专属 skills。

**Q: Skills 会影响 AI 性能吗？**
A: 适度的 skills 会提升性能。但过多无关的 skills 会占用上下文空间。只保留相关的 skills。

**Q: 如何知道我的 skill 是否被使用了？**
A: AI 在回答时如果引用了特定模式或代码，通常就是使用了对应的 skill。你也可以直接问"你刚才用了哪个 skill？"

**Q: Workflow 和 Skill 能互相引用吗？**
A: Workflow 可以提示 AI 查阅某个 skill（如"参考 project-init skill"），但 skill 不应引用 workflow。

---

**创建日期**: 2026-01-11  
**适用项目**: Orbit, Skills抓取器, 及其他多项目环境
