**如何通过配置文件帮助 AI Agent 更好地理解你的代码库**。

------

## 🎯 核心观点

> **Help LLM navigate your codebase with agent configurations**
>
> 用 Agent 配置文件帮助 LLM 导航你的代码库

不同的 AI 工具有不同的"说明书"文件格式，放在项目根目录就能让 AI 自动读取！

## 四种常见的 Agent 配置文件

| 文件名         | 对应工具           | 作用              |
| :------------- | :----------------- | :---------------- |
| `CLAUDE.md`    | Claude (Anthropic) | Claude 专用配置   |
| `.cursorrules` | Cursor             | Cursor 编辑器规则 |
| `AGENTS.md`    | 通用/开放格式      | 适用于多种 Agent  |
| `llms.txt`     | 网页爬虫型 LLM     | 类似 robots.txt   |

## 实际操作建议

### 为你的项目添加配置文件：

```
your-project/

├── CLAUDE.md        # 如果你用 Claude

├── .cursorrules     # 如果你用 Cursor

├── AGENTS.md        # 通用型，推荐都加上

├── README.md

└── src/
```

### 示例 `AGENTS.md` 模板：

```
# 项目名称



## 技术栈

- Frontend: React + TypeScript

- Backend: Node.js + Express

- Database: PostgreSQL



## 代码规范

- 使用 ESLint + Prettier

- 组件使用函数式 + Hooks

- API 响应统一格式：{ success, data, error }



## 文件结构

- `src/components/` - React 组件

- `src/api/` - API 路由

- `src/utils/` - 工具函数



## 常用命令

- `npm run dev` - 启动开发服务器

- `npm run test` - 运行测试

- `npm run build` - 构建生产版本
```

------

## 🎯 一句话总结

> **给 AI 写一份"项目说明书"，让它更快上手你的代码库！**

这些配置文件就像是给新同事准备的 onboarding 文档，只不过这个"新同事"是 AI 