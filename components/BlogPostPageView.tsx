import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { ExtendedRecordMap } from "notion-types";
import { notFound } from "next/navigation";

import { BlogProfileHero } from "@/components/BlogProfileHero";
import { NotionBlogBody } from "@/components/NotionBlogBody";
import { BlogPostTocLayout } from "@/components/BlogPostTocLayout";
import {
  BLOG_PORTAL_SLUG,
  getBlogPortalPostFallback,
} from "@/lib/blogPortal";
import { fetchNotionPageRecordMap } from "@/lib/fetchNotionRecordMap";
import { getNotionPageHeroAssets } from "@/lib/notionPageHero";
import { markdownToHtml } from "@/lib/markdown";
import {
  extractNotionLeadParagraph,
  recordMapWithoutTopLevelBlock,
} from "@/lib/notionLeadParagraph";
import { getNotionPageIdToBlogHref } from "@/lib/notionPageLinks";
import { getPostBySlug } from "@/lib/posts";
import {
  getResolvedCategoryPageIdForApi,
  getSiteCategoryBySlug,
} from "@/lib/siteCategories";
import {
  getNotionTocFromRecordMap,
  type NotionTocItem,
} from "@/lib/notionToc";

type ArticleChromeProps = {
  notionHero: ReturnType<typeof getNotionPageHeroAssets> | null;
  displayTitle: string;
  headingTitle: string;
  showPostHeader: boolean;
  notionLeadPlain: string | null;
  publishedAt: string | null | undefined;
  tocItems: NotionTocItem[];
  body: ReactNode;
};

function BlogPostArticleChrome({
  notionHero,
  displayTitle,
  headingTitle,
  showPostHeader,
  notionLeadPlain,
  publishedAt,
  tocItems,
  body,
}: ArticleChromeProps) {
  return (
    <div className="blog-post-page">
      <BlogProfileHero
        coverUrl={notionHero?.coverUrl}
        iconUrl={notionHero?.iconUrl}
        iconEmoji={notionHero?.iconEmoji}
        title={notionHero?.title ?? displayTitle}
        headingTitle={headingTitle}
      />
      <BlogPostTocLayout tocItems={tocItems}>
        <main className="blog-main blog-main-wide">
          <article
            className={`post-article${showPostHeader ? "" : " post-article--compact-top"}`}
          >
            {showPostHeader ? (
              <header className="post-header">
                {notionLeadPlain ? (
                  <p className="post-lead-notion">{notionLeadPlain}</p>
                ) : null}
                {publishedAt ? (
                  <p className="post-meta">
                    <time dateTime={publishedAt}>{publishedAt}</time>
                  </p>
                ) : null}
              </header>
            ) : null}
            {body}
          </article>
        </main>
      </BlogPostTocLayout>
    </div>
  );
}

export async function generateBlogPostPageMetadata(
  slug: string,
): Promise<Metadata> {
  let title = "文章";
  let pageId: string | null = null;

  try {
    const { data } = getPostBySlug(slug);
    title = data.title;
    pageId =
      typeof data.page_id === "string" && data.page_id.trim()
        ? data.page_id.trim()
        : null;
  } catch {
    const cat = getSiteCategoryBySlug(slug);
    if (cat) {
      title = cat.title;
      pageId = getResolvedCategoryPageIdForApi(cat);
    } else if (slug === BLOG_PORTAL_SLUG) {
      const fb = getBlogPortalPostFallback();
      title = fb.data.title;
      pageId = fb.data.page_id;
    }
  }

  let icons: Metadata["icons"] | undefined;
  if (pageId) {
    try {
      const fetched = await fetchNotionPageRecordMap(pageId);
      if (fetched?.recordMap) {
        const hero = getNotionPageHeroAssets(fetched.recordMap, pageId);
        if (hero?.iconUrl) {
          icons = {
            icon: [{ url: hero.iconUrl }],
            apple: [{ url: hero.iconUrl, sizes: "180x180" }],
          };
        }
      }
    } catch {
      /* 离线或拉取失败时使用根目录 app/icon.svg */
    }
  }

  return {
    title,
    description: `${title} · LJTian Blog`,
    ...(icons ? { icons } : {}),
  };
}

/**
 * 已由 `recordMap` 拉取完成的 Notion 页（如 `app/[pageId]` 未映射子页），与 `/blog/[slug]` 共用版式。
 */
export async function BlogNotionRecordPageView({
  pageId,
  norm,
  recordMap,
}: {
  pageId: string;
  norm: string;
  recordMap: ExtendedRecordMap;
}) {
  const notionHero = getNotionPageHeroAssets(recordMap, pageId);
  const pageUrlByNotionId = getNotionPageIdToBlogHref();
  const notionLead = extractNotionLeadParagraph(recordMap, pageId);
  const recordMapForBody = notionLead
    ? recordMapWithoutTopLevelBlock(recordMap, pageId, notionLead.blockKey)
    : recordMap;

  const displayTitle = notionHero?.title ?? "文章";
  const showPostHeader = Boolean(notionLead);
  const tocItems = getNotionTocFromRecordMap(recordMapForBody, pageId);

  const body = (
    <NotionBlogBody
      recordMap={recordMapForBody}
      pageUrlByNotionId={pageUrlByNotionId}
      rootNotionPageId={pageId}
      blogSlug={norm}
      canonicalPath={`/${norm}`}
    />
  );

  return (
    <BlogPostArticleChrome
      notionHero={notionHero}
      displayTitle={displayTitle}
      headingTitle={displayTitle}
      showPostHeader={showPostHeader}
      notionLeadPlain={notionLead?.plainText ?? null}
      publishedAt={undefined}
      tocItems={tocItems}
      body={body}
    />
  );
}

export async function BlogPostPageView({ slug }: { slug: string }) {
  let post: ReturnType<typeof getPostBySlug> | null = null;
  let category = getSiteCategoryBySlug(slug);

  try {
    post = getPostBySlug(slug);
    category = null;
  } catch {
    if (slug === BLOG_PORTAL_SLUG) {
      post = getBlogPortalPostFallback() as ReturnType<typeof getPostBySlug>;
      category = null;
    } else if (!category) {
      notFound();
    }
  }

  const data = post?.data;
  const content = post?.content ?? "";

  const pageId = category
    ? getResolvedCategoryPageIdForApi(category)
    : typeof data?.page_id === "string" && data.page_id.trim()
      ? data.page_id.trim()
      : null;

  let usedNotion = false;
  let recordMap = null;

  if (pageId) {
    try {
      const fetched = await fetchNotionPageRecordMap(pageId);
      if (fetched) {
        recordMap = fetched.recordMap;
        usedNotion = true;
      }
    } catch (err) {
      console.error("[blog] Notion getPage failed, fallback to markdown:", err);
    }
  }

  const notionHero =
    usedNotion && recordMap && pageId
      ? getNotionPageHeroAssets(recordMap, pageId)
      : null;

  const pageUrlByNotionId = getNotionPageIdToBlogHref();

  const notionLead =
    usedNotion && recordMap && pageId && !category
      ? extractNotionLeadParagraph(recordMap, pageId)
      : null;
  const recordMapForBody =
    usedNotion && recordMap && pageId && notionLead
      ? recordMapWithoutTopLevelBlock(
          recordMap,
          pageId,
          notionLead.blockKey,
        )
      : recordMap;

  const displayTitle = category?.title ?? data?.title ?? slug;
  const showPostHeader = Boolean(
    (!category && notionLead) || data?.published_at,
  );

  const tocItems =
    usedNotion && recordMapForBody && pageId
      ? getNotionTocFromRecordMap(recordMapForBody, pageId)
      : [];

  const isPortal = slug === BLOG_PORTAL_SLUG;

  const body =
    usedNotion && recordMapForBody ? (
      <NotionBlogBody
        recordMap={recordMapForBody}
        pageUrlByNotionId={pageUrlByNotionId}
        rootNotionPageId={pageId}
        blogSlug={slug}
        canonicalPath={isPortal ? "/blog" : undefined}
      />
    ) : (
      <div
        className="post-body post-prose"
        dangerouslySetInnerHTML={{
          __html: await markdownToHtml(content.trim()),
        }}
      />
    );

  return (
    <BlogPostArticleChrome
      notionHero={notionHero}
      displayTitle={displayTitle}
      headingTitle={displayTitle}
      showPostHeader={showPostHeader}
      notionLeadPlain={notionLead?.plainText ?? null}
      publishedAt={data?.published_at}
      tocItems={tocItems}
      body={body}
    />
  );
}
