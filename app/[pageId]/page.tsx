import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { BlogProfileHero } from "@/components/BlogProfileHero";
import { NotionBlogBody } from "@/components/NotionBlogBody";
import { fetchNotionPageRecordMap } from "@/lib/fetchNotionRecordMap";
import { getNotionPageHeroAssets } from "@/lib/notionPageHero";
import {
  extractNotionLeadParagraph,
  recordMapWithoutTopLevelBlock,
} from "@/lib/notionLeadParagraph";
import {
  NOTION_PAGE_ID_HEX32,
  normalizeNotionPageId,
  toDashedNotionPageId,
} from "@/lib/notionPageId";
import { getNotionPageIdToBlogHref } from "@/lib/notionPageLinks";

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

  const notionHero = getNotionPageHeroAssets(recordMap, pageId);
  const pageUrlByNotionId = getNotionPageIdToBlogHref();
  const notionLead = extractNotionLeadParagraph(recordMap, pageId);
  const recordMapForBody = notionLead
    ? recordMapWithoutTopLevelBlock(recordMap, pageId, notionLead.blockKey)
    : recordMap;

  const displayTitle = notionHero?.title ?? "文章";
  const canonicalPath = `/${norm}`;
  const showPostHeader = Boolean(notionLead);

  return (
    <div className="blog-layout-root tb-site" suppressHydrationWarning>
      <div className="blog-post-page">
        <BlogProfileHero
          coverUrl={notionHero?.coverUrl}
          iconUrl={notionHero?.iconUrl}
          iconEmoji={notionHero?.iconEmoji}
          title={notionHero?.title ?? displayTitle}
          headingTitle={displayTitle}
        />
        <main className="blog-main blog-main-wide">
          <article
            className={`post-article${showPostHeader ? "" : " post-article--compact-top"}`}
          >
            {showPostHeader ? (
              <header className="post-header">
                {notionLead ? (
                  <p className="post-lead-notion">{notionLead.plainText}</p>
                ) : null}
              </header>
            ) : null}
            <NotionBlogBody
              recordMap={recordMapForBody}
              pageUrlByNotionId={pageUrlByNotionId}
              rootNotionPageId={pageId}
              blogSlug={norm}
              canonicalPath={canonicalPath}
            />
          </article>
        </main>
      </div>
    </div>
  );
}
