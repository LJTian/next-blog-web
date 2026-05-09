import "server-only";

import {
  extractNotionPageIdHex32,
  normalizeNotionPageId,
  toDashedNotionPageId,
} from "@/lib/notionPageId";

/**
 * 画廊「分类」数据库中每一行对应的 Notion 页面。
 * 填好 `notionPageId` 后，站内链接与 `/{pageId}` 重定向会指向 `/blog/{slug}`。
 *
 * 请把下面 8 条的 `notionPageId` 换成你在 Notion 里打开该分类页 →「复制链接」中的 32 位 ID
 *（带短横线亦可）。`slug` / `title` 可按站点需要修改，避免与已有文章 slug 冲突。
 */
export type SiteCategory = {
  /** 本站路径 `/blog/{slug}` */
  slug: string;
  /** 页面标题（元数据、Hero 回退文案） */
  title: string;
  /** Notion 页面 ID（uuid 或 32 位 hex） */
  notionPageId: string;
  /**
   * 可选：与博客索引库中「分类」属性取值一致，便于后续按属性筛文章
   */
  notionLabel?: string;
};

export const SITE_CATEGORIES: readonly SiteCategory[] = [
  {
    slug: "cloud-native",
    title: "云原生",
    notionLabel: "云原生",
    notionPageId: "552f72a9d1a44a1da3960f5c562bedfa",
  },
  {
    slug: "ai",
    title: "AI",
    notionLabel: "AI",
    notionPageId: "AI-2dfac97ce94c80e88b8bc9be540cdfc6",
  },
  {
    slug: "linux",
    title: "Linux",
    notionPageId: "Linux-ad5a5e53f5e64a1e96f698f7e39e2ecf",
  },
  {
    slug: "Docker",
    title: "Docker",
    notionPageId: "Docker-824d9e4927f040ae875f5804b306d3d5",
  },
  {
    slug: "GO(Golang)",
    title: "GO(Golang)",
    notionPageId: "GO-golang-e4c665ea8363483f8e018f7def39bbbc",
  },
  {
    slug: "English",
    title: "英语",
    notionPageId: "English-225ac97ce94c80d28903c2414e938046",
  },
  {
    slug: "other",
    title: "其它",
    notionPageId: "other-22caede5bdcd42a6b167de9593b04d51",
  },
  {
    slug: "业余爱好",
    title: "业余爱好",
    notionPageId: "2dfac97ce94c80f49097e3b5c7bfcc9a",
  },
];

function isConfiguredId(raw: string): boolean {
  return extractNotionPageIdHex32(raw) !== null;
}

/** 分类页拉取 Notion 用的 ID（带短横线） */
export function getResolvedCategoryPageIdForApi(c: SiteCategory): string | null {
  const hex = extractNotionPageIdHex32(c.notionPageId);
  return hex ? toDashedNotionPageId(hex) : null;
}

/** 已填写有效 Notion ID 的分类（参与预渲染与 ID 映射） */
export function getConfiguredSiteCategories(): SiteCategory[] {
  return SITE_CATEGORIES.filter((c) => isConfiguredId(c.notionPageId));
}

export function getSiteCategoryBySlug(slug: string): SiteCategory | null {
  const t = slug.trim();
  if (!t) return null;
  return (
    SITE_CATEGORIES.find((c) => c.slug === t && isConfiguredId(c.notionPageId)) ??
    null
  );
}

/**
 * 参与 `generateStaticParams` 的分类 slug。
 * 与 `content/posts` 已有 slug 冲突时跳过该分类（以文章为准）。
 */
export function getCategorySlugsForStatic(postFileSlugs: string[]): string[] {
  const taken = new Set(postFileSlugs.map((s) => s.trim()).filter(Boolean));
  return getConfiguredSiteCategories()
    .map((c) => c.slug.trim())
    .filter((s) => s && !taken.has(s));
}

/**
 * 分类 Notion 页 → 本站路径（仅含已配置 id；文章 frontmatter 映射可覆盖同名 key）
 */
export function getCategoryNotionPageIdToHref(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of getConfiguredSiteCategories()) {
    const hex = extractNotionPageIdHex32(c.notionPageId);
    if (!hex) continue;
    out[hex] = `/blog/${c.slug}`;
  }
  return out;
}
