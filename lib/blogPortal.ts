/**
 * 博客门户：优先读 `content/posts/{slug}.md`（同步脚本生成），由 `/blog` 渲染。
 * 生产环境常未提交 `*.md`（见 .gitignore），故用内置 page_id 兜底拉 Notion（与 `scripts/sync-notion.mjs` 门户条目一致）。
 * 可选环境变量 `NOTION_BLOG_PORTAL_PAGE_ID`（32 位 hex）覆盖默认页面。
 */
export const BLOG_PORTAL_SLUG = "ljtian-blog" as const;

/** 与 scripts/sync-notion.mjs 中门户 `STATIC_POSTS` 的 pageId 保持一致 */
const DEFAULT_BLOG_PORTAL_PAGE_ID = "ce8a73f53641460cb4ba5f92596ae14b";

export function getBlogPortalPageId(): string {
  const fromEnv = process.env.NOTION_BLOG_PORTAL_PAGE_ID?.trim().replace(/-/g, "");
  if (fromEnv && /^[a-f0-9]{32}$/i.test(fromEnv)) return fromEnv;
  return DEFAULT_BLOG_PORTAL_PAGE_ID;
}

/** 无本地 Markdown 时 `/blog` 仍可通过 page_id 渲染 Notion */
export function getBlogPortalPostFallback(): {
  content: string;
  data: {
    title: string;
    slug: typeof BLOG_PORTAL_SLUG;
    page_id: string;
    published_at: null;
  };
} {
  return {
    content: "",
    data: {
      title: "LJTian Blog",
      slug: BLOG_PORTAL_SLUG,
      page_id: getBlogPortalPageId(),
      published_at: null,
    },
  };
}
