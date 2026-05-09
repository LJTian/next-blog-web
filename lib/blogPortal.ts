/**
 * 博客门户：对应 `content/posts/{slug}.md`（Notion 同步），由 `/blog` 渲染。
 * 不再生成 `/blog/{slug}`，旧地址永久重定向到 `/blog`。
 */
export const BLOG_PORTAL_SLUG = "ljtian-blog" as const;
