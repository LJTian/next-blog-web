import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BlogHomeFab } from "@/components/BlogHomeFab";
import {
  BlogNotionRecordPageView,
} from "@/components/BlogPostPageView";
import { fetchNotionPageRecordMap } from "@/lib/fetchNotionRecordMap";
import { getNotionPageHeroAssets } from "@/lib/notionPageHero";
import {
  NOTION_PAGE_ID_HEX32,
  normalizeNotionPageId,
  toDashedNotionPageId,
} from "@/lib/notionPageId";
import { getNotionPageIdToBlogHref } from "@/lib/notionPageLinks";
import { getBlogFabNavCategories } from "@/lib/siteCategories";

/**
 * 已映射 ID → 301 到 `/blog/{slug}`；未映射但可公开拉取的 Notion 页 → 直接渲染（分类下的子页等）。
 */
export const dynamicParams = true;
export const revalidate = 60;

export function generateStaticParams() {
  const map = getNotionPageIdToBlogHref();
  return Object.keys(map).map((pageId) => ({ pageId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageId: string }>;
}): Promise<Metadata> {
  const { pageId: raw } = await params;
  const norm = normalizeNotionPageId(raw);
  if (!NOTION_PAGE_ID_HEX32.test(norm)) {
    return { title: "未找到" };
  }
  if (getNotionPageIdToBlogHref()[norm]) {
    return { title: "LJTian Blog" };
  }

  const pageId = toDashedNotionPageId(norm);
  let title = "文章";
  let icons: Metadata["icons"] | undefined;
  try {
    const fetched = await fetchNotionPageRecordMap(pageId);
    if (fetched?.recordMap) {
      const hero = getNotionPageHeroAssets(fetched.recordMap, pageId);
      title = hero?.title ?? title;
      if (hero?.iconUrl) {
        icons = {
          icon: [{ url: hero.iconUrl }],
          apple: [{ url: hero.iconUrl, sizes: "180x180" }],
        };
      }
    }
  } catch {
    /* 使用默认标题 */
  }

  return {
    title,
    description: `${title} · LJTian Blog`,
    ...(icons ? { icons } : {}),
  };
}

export default async function NotionPageIdRoute({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId: raw } = await params;
  const norm = normalizeNotionPageId(raw);
  if (!NOTION_PAGE_ID_HEX32.test(norm)) {
    notFound();
  }

  const mappedHref = getNotionPageIdToBlogHref()[norm];
  if (mappedHref) {
    redirect(mappedHref);
  }

  const pageId = toDashedNotionPageId(norm);
  let recordMap = null;
  try {
    const fetched = await fetchNotionPageRecordMap(pageId);
    if (fetched) {
      recordMap = fetched.recordMap;
    }
  } catch {
    notFound();
  }
  if (!recordMap) {
    notFound();
  }

  const fabCategories = getBlogFabNavCategories();

  return (
    <div className="blog-layout-root tb-site" suppressHydrationWarning>
      <BlogNotionRecordPageView
        pageId={pageId}
        norm={norm}
        recordMap={recordMap}
      />
      <BlogHomeFab categories={fabCategories} />
    </div>
  );
}
