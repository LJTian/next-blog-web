# Notion Blog 最小版设计

## 背景

当前仓库基本为空，需要快速开发一个可部署到 Vercel 的 blog。第一版目标是把现有 Notion 页面作为主要内容嵌入，而不是重建内容系统。

Notion 页面：

`https://tianlj.notion.site/LJTian-Blog-ce8a73f53641460cb4ba5f92596ae14b`

## 目标

- 创建一个最小可用的 blog 网站。
- 首页直接通过 `iframe` 嵌入公开 Notion 页面。
- 提供基础页面外壳，包括站点标题、顶部栏和打开原 Notion 页面的入口。
- 使用 Vercel 能自动识别和部署的 Next.js 项目结构。
- 优先保证实现速度和部署路径简单。

## 非目标

- 不接入 Notion API。
- 不同步或解析 Notion 内容。
- 不做文章级路由、搜索、标签、评论或订阅。
- 不为第一版优化正文 SEO，因为 iframe 内容不会作为页面 HTML 直接暴露。

## 推荐方案

使用 `Next.js + iframe`。

Next.js 提供 Vercel 原生部署体验，`package.json` 中包含标准脚本后，Vercel 可以按默认流程安装依赖、构建并发布。页面主体使用全高 `iframe` 加载 Notion 页面，顶部保留轻量导航，便于用户打开原页面。

## 页面结构

- `app/page.tsx`：首页，渲染 blog 外壳和 Notion `iframe`。
- `app/layout.tsx`：全局元数据和 HTML 壳。
- `app/globals.css`：基础布局和响应式样式。
- `package.json`：提供 `dev`、`build`、`start` 和 `lint` 脚本。
- `next.config`：保持最小配置，除非实现时发现不需要该文件。

## 用户体验

页面打开后，用户第一眼看到简洁顶部栏和嵌入的 Notion blog。顶部栏包含站点名 `LJTian Blog` 和一个打开 Notion 原页面的链接。主体区域尽量把空间让给 Notion 内容，避免额外装饰影响阅读。

移动端保持相同结构：顶部栏压缩高度，`iframe` 占据剩余视口高度。

## 错误处理

如果 Notion 页面因为权限、网络或浏览器策略无法加载，页面仍保留顶部栏和“打开 Notion”入口，用户可以跳转到原页面阅读。第一版不实现复杂的 iframe 加载失败检测。

## 测试和验证

- 运行依赖安装。
- 运行 `npm run build`，确认 Next.js 项目可构建。
- 本地运行开发服务器，确认首页能打开并显示 iframe 容器。
- 检查项目结构适合 Vercel 默认部署。

## 范围边界

第一版完成后，网站只承载一个嵌入式 Notion blog 首页。后续如果需要 SEO、独立文章页或更强样式控制，再引入 Notion API 或内容同步方案。
