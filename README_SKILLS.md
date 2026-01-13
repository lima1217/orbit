# Orbit 项目 - Skills & Workflows 系统总览

> 为 Antigravity 打造的智能知识库和自动化工作流

---

## 📦 已部署的系统

### ✅ Claude Skills（3个）

#### 1. **react-patterns** 
React + TypeScript 开发模式
- Context API 模式
- 自定义 Hooks（useLocalStorage）
- Framer Motion 动画标准
- TypeScript 最佳实践
- 项目结构建议

#### 2. **time-ui-patterns**
时间相关 UI 专业知识
- Living Timezone 计算
- 日出/日落时间
- 相对时间显示
- Orbit Hour 可视化系统
- 时间选择器 UI 模式

#### 3. **project-init**
项目初始化模板
- Vite + React + TypeScript 脚手架
- 依赖包推荐
- 配置文件模板
- CSS Reset 和设计系统

---

### ✅ Antigravity Workflows（2个）

#### 1. **/new-react-project**
创建新 React 项目的完整流程
- 初始化 Vite 项目
- 安装依赖
- 创建目录结构
- 配置开发环境
- Git 初始化

#### 2. **/ui-ux-pro-max**
UI/UX 设计与实现流程
（你已有的 workflow）

---

## 🎯 如何使用

### 自动触发（Skills）

当你在开发过程中遇到以下问题时，AI 会**自动**引用相关 skills：

```
你问：如何实现 localStorage 持久化？
AI 查阅：react-patterns skill
AI 回答：[提供 useLocalStorage hook 代码]

你问：如何计算用户的 living timezone？
AI 查阅：time-ui-patterns skill  
AI 回答：[提供 calculateLivingTimezone 函数]

你问：创建新项目的标准配置是什么？
AI 查阅：project-init skill
AI 回答：[提供完整的 tsconfig.json 和项目结构]
```

### 手动触发（Workflows）

使用斜杠命令直接调用：

```
/new-react-project        # 创建新 React 项目
/ui-ux-pro-max           # 启动 UI 设计流程
```

---

## 📂 文件位置

```
Orbit/
├── .claude/
│   ├── SKILLS_GUIDE.md                    # 📖 完整使用指南
│   └── skills/
│       ├── .claude-plugin/
│       │   └── plugin.json                # ⚙️ Skills 配置
│       ├── react-patterns/
│       │   └── SKILL.md                   # 🎨 React 开发知识库
│       ├── time-ui-patterns/
│       │   └── SKILL.md                   # ⏰ 时间 UI 知识库
│       └── project-init/
│           └── SKILL.md                   # 🚀 项目初始化模板
└── .agent/
    └── workflows/
        ├── new-react-project.md           # 📋 新项目工作流
        └── ui-ux-pro-max.md               # 🎨 UI 设计工作流
```

---

## 🚀 下一步行动

### 1. 重启 Antigravity
使新创建的 skills 生效

### 2. 测试 Skills（自动应用）
尝试问：
- "如何在 React 中使用 Context API？"
- "创建一个时间选择器组件"
- "新项目的 TypeScript 配置应该怎么写？"

观察 AI 是否自动引用相应的 skills

### 3. 测试 Workflow（手动调用）
输入：`/new-react-project`
验证是否按步骤执行

### 4. 为其他项目创建 Skills
如果你的 "Skills抓取器" 项目需要专业知识，可以创建：
```
/Users/zhangwei/Desktop/Skills抓取器/.claude/skills/web-scraping/SKILL.md
```

---

## 💡 扩展建议

### 为你的其他项目创建专属 Skills

根据你的 Desktop 目录，可以考虑创建：

1. **营销文案 Skill**（基于你的大量文案文档）
   - 创意写作模式
   - 品牌语调参考
   - 文案结构模板

2. **Web Scraping Skill**（基于 Skills抓取器项目）
   - Puppeteer 模式
   - 数据清洗模板
   - 反爬虫策略

3. **视频制作 Skill**（基于剪辑练习目录）
   - 脚本结构
   - 镜头语言
   - 剪辑节奏

---

## 📚 参考资料

- **完整指南**: 查看 `.claude/SKILLS_GUIDE.md`
- **官方文档**: [Claude Code Skills Documentation](https://docs.anthropic.com/en/docs/claude-code/skills)
- **Makepad Skills 参考**: [GitHub - ZhangHanDong/makepad-skills](https://github.com/ZhangHanDong/makepad-skills)

---

**创建时间**: 2026-01-11 05:02  
**状态**: ✅ 已部署并可用  
**维护者**: 张唯
