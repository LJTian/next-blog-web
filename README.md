# LJTian Blog

基于 **Notion + Next.js + Vercel** 的博客：列表与路由可由同步脚本生成的 `content/posts/*.md`（frontmatter）驱动；文章正文渲染对齐 **[nextjs-notion-starter-kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit)**：

1. **默认**：[`notion-client`](https://github.com/NotionX/react-notion-x/tree/master/packages/notion-client) 的 `NotionAPI` **不传 Cookie**，要求对应 Notion 页面已 **[发布到网页](https://www.notion.so/help/public-pages-and-web-links)**（公开可读）。嵌入数据库 / 画廊与 starter 一致可拉取。
2. **可选**：`NOTION_API_BASE_URL` —— 指向自托管 API 代理（与 starter [lib/notion-api.ts](https://github.com/transitive-bullshit/nextjs-notion-starter-kit/blob/main/lib/notion-api.ts) 相同变量名）。
3. **兜底**：若公开接口失败且配置了 `NOTION_API_KEY`，则走 **notion-compat（官方 API）**；嵌入 `child_database` 仍可能不完整。

文章路由使用 **`revalidate = 60`（ISR）**，而非每次请求强刷。拉取失败时回退本地 Markdown。

同步脚本仍可用：[Retrieve a page as markdown](https://developers.notion.com/reference/retrieve-page-markdown)、数据源：[Query a data source](https://developers.notion.com/reference/query-a-data-source)。

## 前置条件

1. 在 Notion 创建 **Integration（连接）**，并为目标页面或数据库 **授予访问权限**。
2. 拉取 Markdown 需要连接具备对页面的 **read content** 能力；否则会返回 403（见官方文档说明）。
3. **`NOTION_API_KEY`**：给同步脚本、以及「仅官方 API」渲染路径使用（勿 `NEXT_PUBLIC_`）。
4. **`NOTION_API_BASE_URL`**（可选）：Notion API 代理地址，与 starter kit 一致。

## 文章列表（两种方式任选）

### A. 静态列表（默认）

未设置数据源 ID 时，[`scripts/sync-notion.mjs`](scripts/sync-notion.mjs) 使用内置的 `STATIC_POSTS`（`title` / `slug` / `pageId`）。按需改数组即可。

### B. Notion 数据源（推荐）

在博客索引数据库中建议包含：`title`、`slug`、`status`、`published_at`（与你的 Notion 属性名一致即可）。

设置环境变量：

| 变量 | 说明 |
|------|------|
| `NOTION_POSTS_DATA_SOURCE_ID` | 数据源 ID；设置后从数据源查询已发布文章 |
| `NOTION_PROP_STATUS` | 状态属性名，默认 `status` |
| `NOTION_STATUS_PUBLISHED_VALUE` | 已发布选项值，默认 `published` |
| `NOTION_PROP_TITLE` | 标题属性名，默认 `title` |
| `NOTION_PROP_SLUG` | slug 属性（`rich_text`），默认 `slug` |
| `NOTION_PROP_PUBLISHED_AT` | 日期属性名，默认 `published_at` |
| `NOTION_VERSION` | 可选，默认 `2026-03-11` |

查询结果中每一行对应一篇 **页面**：使用该页的 `id` 调用 Markdown 接口。若 slug 为空，会用标题生成 slug 并带上 id 前缀以免冲突。

## 分类（画廊数据库）

首页/文章里嵌入的 **分类** 画廊中，每个卡片对应一个 Notion **页面**。在 [`lib/siteCategories.ts`](lib/siteCategories.ts) 中维护最多 8 条（可按需增删）：

| 字段 | 说明 |
|------|------|
| `slug` | 本站地址 `/blog/{slug}`，勿与 `content/posts` 里已有文章 slug 重复 |
| `title` | 页面标题（元数据、Hero） |
| `notionPageId` | 该分类页的 ID：可填标准 UUID、纯 32 位 hex，或直接粘贴 Notion 链接里 `标题-xxxxxxxx...` 整段（会自动取末尾 32 位 hex） |
| `notionLabel` | 可选；与索引库「分类」属性取值一致时便于日后按属性筛文章 |

填好 `notionPageId` 后：

- `/{pageId}` 与正文内链会解析到对应的 `/blog/{slug}`；
- 分类页由 **Notion 实时渲染**，无需再为每个分类写 `content/posts/*.md`。

未填写 ID 的条目不参与预渲染与映射，直至补全。

### 分类下的子页（第三级链接）

未写入 `content/posts`、也未在 `siteCategories` 中的 **Notion 子页面**（例如分类页里的「云原生学习路线」），正文内链会落到 `/{32位页面ID}`。此前未映射会直接 404；现在会在该路径 **直接拉取并渲染** 对应公开 Notion 页（与文章页同一套 Hero + 正文）。若页面未发布到网页或拉取失败，仍会 404。若希望使用固定短链 `/blog/xxx`，请为该页补一篇带 `page_id` 的 Markdown 或将其加入分类映射。

## 运行环境

本项目要求 **Node.js 22+**（仓库根目录已有 [`.nvmrc`](.nvmrc) / [`.node-version`](.node-version)，可用 `nvm use`、`fnm use` 等对齐）。Next.js 15 与此版本兼容；本地执行 `npm run dev` / `npm run build` 前请先切换到 22。在 Vercel 项目 **Settings → General → Node.js Version** 中请选择 **22.x**。

## 本地开发

```bash
npm install
npm run sync:notion   # 需要密钥，见下
npm run dev
```

在项目根目录新建 **`.env.local`**（勿提交 Git），写入 `NOTION_API_KEY=secret_xxx` 或 `ntn_xxx`。Next.js 开发服务器会自动加载，文章页即可走 **Notion 实时渲染**；不配则使用本地 Markdown 回退。

打开 `http://localhost:3000`（首页会重定向到 `/blog`）。

`npm run dev` **不会**自动同步；修改 Notion 后请重新执行 `npm run sync:notion`。

## 生产构建

```bash
npm run build
```

等同于先 `sync:notion` 再 `next build`。Vercel 上配置 **`NOTION_API_KEY`**（及按需的数据源相关变量），Build Command 使用默认 `npm run build` 即可。

## 生成内容目录

同步脚本写入 `content/posts/*.md`。仓库通过 `.gitignore` 忽略这些文件，仅保留 [`content/posts/.gitkeep`](content/posts/.gitkeep)；部署以构建期同步为准。

## 脚本与校验

| 命令 | 作用 |
|------|------|
| `npm run sync:notion` | 从 Notion 拉 Markdown 并生成 frontmatter + 正文 |
| `npm run lint` | `tsc --noEmit` |
| `npm test` | 运行 [`tests/run.mjs`](tests/run.mjs)（posts 与 `formatNotionId`） |

## 大页面截断

若单页极大导致 `truncated` 与 `unknown_block_ids`，脚本会按官方说明对子树 ID 继续请求并拼接 Markdown（无权限的块会跳过并打日志）。
