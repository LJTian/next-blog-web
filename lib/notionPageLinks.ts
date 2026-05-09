import "server-only";

import { BLOG_PORTAL_SLUG } from "@/lib/blogPortal";
import {
  normalizeNotionPageId,
  NOTION_PAGE_ID_HEX32,
} from "@/lib/notionPageId";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { getCategoryNotionPageIdToHref } from "@/lib/siteCategories";

export { normalizeNotionPageId, NOTION_PAGE_ID_HEX32 } from "@/lib/notionPageId";

/**
 * 规范化页面 ID → 本站路径 `/blog/{slug}`。
 * 含：`lib/siteCategories` 中已配置的分类页，以及 frontmatter 里声明了 `page_id` 的文章（后者覆盖同名 ID）。
 */
export function getNotionPageIdToBlogHref(cwd?: string): Record<string, string> {
  const map: Record<string, string> = { ...getCategoryNotionPageIdToHref() };
  for (const fileSlug of getAllSlugs(cwd)) {
    const { data } = getPostBySlug(fileSlug, cwd);
    const raw =
      typeof data.page_id === "string" ? data.page_id.trim() : "";
    if (!raw) continue;
    const norm = normalizeNotionPageId(raw);
    if (!NOTION_PAGE_ID_HEX32.test(norm)) continue;
    const slug = typeof data.slug === "string" ? data.slug.trim() : "";
    const eff = slug || fileSlug;
    const isPortal =
      fileSlug === BLOG_PORTAL_SLUG || eff === BLOG_PORTAL_SLUG;
    map[norm] = isPortal ? "/blog" : `/blog/${eff}`;
  }
  return map;
}
