# LJTian 技术博客

基于 Astro + Markdown + Tailwind CSS 构建的技术博客,部署于 Cloudflare Pages。

## 技术栈

- **框架**: [Astro](https://astro.build/) 5.x - 现代静态站点生成器
- **样式**: [Tailwind CSS](https://tailwindcss.com/) 3.x
- **部署**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **内容**: Markdown + Frontmatter

## 项目结构

```
.
├── src/
│   ├── content/
│   │   ├── config.ts          # Content collections 配置
│   │   └── posts/             # Markdown 文章目录
│   ├── layouts/
│   │   └── BaseLayout.astro   # 基础布局
│   ├── pages/
│   │   ├── index.astro        # 首页
│   │   ├── about.astro        # 关于页面
│   │   └── posts/
│   │       ├── index.astro    # 文章列表
│   │       └── [slug].astro   # 文章详情
│   └── styles/
│       └── global.css         # 全局样式
├── public/                    # 静态资源
├── astro.config.mjs           # Astro 配置
└── tailwind.config.mjs        # Tailwind 配置
```

## 本地开发

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

访问 http://localhost:4321

### 构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建

```bash
npm run preview
```

## 添加新文章

在 `src/content/posts/` 目录下创建 `.md` 文件:

```markdown
---
title: "文章标题"
date: "2026-09-02"
description: "文章摘要"
tags: ["标签1", "标签2"]
---

# 文章标题

文章内容...
```

Frontmatter 字段说明:
- `title` (必需): 文章标题
- `date` (必需): 发布日期,格式 YYYY-MM-DD
- `description` (必需): 文章摘要,显示在列表页
- `tags` (可选): 文章标签数组

## Cloudflare Pages 部署

### 构建配置

- **构建命令**: `npm run build`
- **构建输出目录**: `dist`
- **Node 版本**: 22.x

### 部署步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages → Create a project
3. 连接 GitHub 仓库 `LJTian/next-blog-web`
4. 配置构建设置:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
5. 点击 "Save and Deploy"

每次推送到主分支,Cloudflare Pages 会自动触发构建和部署。

## 设计规范

### 颜色

使用 CSS 变量定义,位于 `src/styles/global.css`:

- `--color-background`: #F7F6F3 (背景色)
- `--color-text`: #171717 (主文本)
- `--color-muted`: #737373 (次要文本)
- `--color-hairline`: #E6E4DE (分隔线)
- `--color-accent`: #0E7C66 (强调色,仅用于链接和代码块边框)

### 排版

- **正文字体**: Inter + Noto Sans SC
- **代码字体**: JetBrains Mono
- **正文大小**: 18px
- **行高**: 1.75
- **阅读宽度**: 68ch

## 与旧版本的差异

本项目是对原 Next.js 版本的完全重写:

### 旧版本 (Next.js)
- 基于 Next.js 15 + React 19
- 使用 Notion 作为 CMS,实时拉取内容
- 依赖 `notion-client` 和 `react-notion-x`
- 需要 Notion API 密钥
- 部署到 Vercel

### 新版本 (Astro)
- 基于 Astro 5 静态生成
- Markdown 文件作为内容源
- 无外部依赖,纯静态站点
- 简化的设计系统
- 部署到 Cloudflare Pages

主要优势:
- ✅ 更快的加载速度(完全静态)
- ✅ 更简单的内容管理(Markdown 文件)
- ✅ 更低的运行成本(无服务器调用)
- ✅ 更好的可移植性(纯静态资源)

## License

MIT
