# LJTian Blog

## 项目是什么

这是一个 **以 Notion 为内容源、用 Next.js 渲染** 的个人博客站点。你在 Notion 里编辑页面并（按需）「发布到网页」后，站点可以 **实时拉取页面结构** 展示；同时支持用脚本把文章 **同步成仓库里的 Markdown**（`content/posts`），用于生成路由元数据、SEO 以及在 Notion 不可用时 **回退展示**。

整体设计与 **[nextjs-notion-starter-kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit)** 对齐：使用 [`notion-client`](https://github.com/NotionX/react-notion-x) + [`react-notion-x`](https://github.com/NotionX/react-notion-x) 渲染公开 Notion 页；需要密钥或官方 API 时走 `@notionhq/client` 与 **notion-compat** 路径。适合希望 **主内容仍在 Notion**、站点只负责展示与导航的博客场景。

## 核心能力

- **门户首页**：根路径 `/` 重定向到 **`/blog`**，展示配置的门户 Notion 页（整块内容即「博客首页」）。
- **文章路由**：**`/blog/[slug]`** 对应同步脚本生成的本地 frontmatter（`content/posts/*.md`），正文优先按 Notion 页面实时渲染，失败时使用本地 Markdown。
- **按页面 ID 打开**：**`/[pageId]`**（32 位 hex）用于未写入 `content/posts`、也未在分类里映射的 Notion 子页链接，直接拉取并渲染同一套文章壳（Hero、目录、正文等）。
- **分类画廊**：在 [`lib/siteCategories.ts`](lib/siteCategories.ts) 维护 `SITE_CATEGORIES`，把 Notion 分类页映射为固定 **`/blog/{slug}`**，并驱动 FAB 等导航。
- **增量与缓存**：相关页面使用 **`revalidate = 60`（ISR）**，定时刷新而非每次请求强刷 Notion。
- **同步脚本**：[`scripts/sync-notion.mjs`](scripts/sync-notion.mjs) 可从 Notion **拉 Markdown + frontmatter** 写入 `content/posts`；支持静态列表或 **数据源（Database）** 驱动文章列表（环境变量见脚本内说明与 Notion 官方 [Markdown](https://developers.notion.com/reference/retrieve-page-markdown)、[数据源查询](https://developers.notion.com/reference/query-a-data-source)）。

## 页面与路由一览

| 路径 | 作用 |
|------|------|
| `/` | 重定向到 `/blog` |
| `/blog` | Notion 门户首页 |
| `/blog/[slug]` | 单篇文章（slug 来自本地 `content/posts` 元数据） |
| `/[pageId]` | 按 Notion 页面 ID 直接渲染（hex，无连字符） |

## 技术栈

- **框架**：Next.js 15（App Router）、React 19  
- **Notion**：notion-client、react-notion-x、notion-compat、@notionhq/client  
- **Markdown 管线**（部分文章/回退）：remark / rehype 等（见 `package.json`）  
- **运行要求**：**Node.js 22+**（见 [`.node-version`](.node-version)）；部署到 Vercel 时建议选择 **22.x**

## 本地开发

```bash
npm install
# 在项目根新建 .env.local（勿提交），见下文
npm run dev
# 需局域网访问时：npm run dev -- -H 0.0.0.0
```

| 脚本 | 说明 |
|------|------|
| `npm run sync:notion` | 从 Notion 生成/更新 `content/posts/*.md`（需 `NOTION_API_KEY`） |
| `npm run build` | 仅执行 `next build` |
| `npm run build:sync` | 先同步再构建（CI 需要最新 Markdown 时用） |
| `npm run lint` | `tsc --noEmit` |
| `npm test` | [`tests/run.mjs`](tests/run.mjs) |

开发时 **`npm run dev` 不会自动同步**；改 Notion 后如需更新本地列表与 frontmatter，请自行再跑 `sync:notion`。

## 环境变量（`.env.local`）

| 变量 | 用途 |
|------|------|
| `NOTION_API_KEY` | 同步脚本；公开 Notion 接口不可用时的渲染兜底（勿使用 `NEXT_PUBLIC_` 前缀） |
| `NOTION_API_BASE_URL` | 可选：匿名 Notion 接口的代理基地址 |
| `NOTION_POSTS_DATA_SOURCE_ID` 与 `NOTION_PROP_*` | 可选：用数据源驱动同步列表（详见 [`scripts/sync-notion.mjs`](scripts/sync-notion.mjs)） |
| `NOTION_LOG` / `NEXT_PUBLIC_NOTION_LOG` | 设为 `quiet`、`0` 或 `false` 可减少服务端或浏览器侧部分日志 |
| `NEXT_DEV_ALLOWED_ORIGINS` | 用局域网 IP 访问开发服务器时，在此填写 hostname（多个用逗号或空格），与 `next.config.mjs` 中的 `allowedDevOrigins` 配合 |
| `NOTION_BLOG_PORTAL_PAGE_ID` | 可选：32 位 hex（可无连字符），覆盖 `/blog` 门户对应的 Notion 页面 ID；不设则与 [`scripts/sync-notion.mjs`](scripts/sync-notion.mjs) 内门户条目一致 |

**Vercel**：`content/posts/*.md` 默认不进仓库时，`/blog` 仍凭内置门户 `page_id` 拉 Notion，不应再因缺文件而 404。若线上曾出现过 404，边缘可能缓存约 1 分钟；部署修复后可等待 TTL 或在 Vercel 做一次 **Redeploy / Purge Cache**。其余 **`/blog/[slug]`** 若无对应 Markdown 或未映射分类，仍会继续返回 404。

## 代码入口提示

- 门户 slug、`page_id` 兜底：[`lib/blogPortal.ts`](lib/blogPortal.ts)  
- 文章页壳层：[`components/BlogPostPageView.tsx`](components/BlogPostPageView.tsx)  
- 拉取 Notion `recordMap`：[`lib/fetchNotionRecordMap.ts`](lib/fetchNotionRecordMap.ts)  
- 分类与 slug 映射：[`lib/siteCategories.ts`](lib/siteCategories.ts)  
- 本地文章列表（元数据）：[`lib/posts.js`](lib/posts.js) 中的 `getAllPosts()`  

`content/posts/*.md` 通常由同步脚本生成；仓库可能通过 `.gitignore` 忽略正文文件，仅保留 [`content/posts/.gitkeep`](content/posts/.gitkeep)。
