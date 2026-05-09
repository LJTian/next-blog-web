import "server-only";

import {
  normalizeNotionPageId,
  NOTION_PAGE_ID_HEX32,
} from "@/lib/notionPageId";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";

export { normalizeNotionPageId, NOTION_PAGE_ID_HEX32 } from "@/lib/notionPageId";

/**
 * 规范化页面 ID → 本站路径 `/blog/{slug}`。
 * 仅包含 frontmatter 里声明了 page_id 的文章。
 */
export function getNotionPageIdToBlogHref(cwd?: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const fileSlug of getAllSlugs(cwd)) {
    const { data } = getPostBySlug(fileSlug, cwd);
    const raw =
      typeof data.page_id === "string" ? data.page_id.trim() : "";
    if (!raw) continue;
    const norm = normalizeNotionPageId(raw);
    if (!NOTION_PAGE_ID_HEX32.test(norm)) continue;
    const slug = typeof data.slug === "string" ? data.slug.trim() : "";
    map[norm] = `/blog/${slug || fileSlug}`;
  }
  return map;
}
