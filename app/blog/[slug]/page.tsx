import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogProfileHero } from "@/components/BlogProfileHero";
import { NotionBlogBody } from "@/components/NotionBlogBody";
import { fetchNotionPageRecordMap } from "@/lib/fetchNotionRecordMap";
import { getNotionPageHeroAssets } from "@/lib/notionPageHero";
import { markdownToHtml } from "@/lib/markdown";
import {
  extractNotionLeadParagraph,
  recordMapWithoutTopLevelBlock,
} from "@/lib/notionLeadParagraph";
import { getNotionPageIdToBlogHref } from "@/lib/notionPageLinks";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";

/** ISR：与 starter kit 思路一致，定时重新验证 Notion 公开页内容（秒） */
export const revalidate = 60;

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = getPostBySlug(slug);
    const pageId =
      typeof data.page_id === "string" && data.page_id.trim()
        ? data.page_id.trim()
        : null;

    /** 标签页图标：使用 Notion 页面图标（上传图 / Notion 内置 icons），非截图 */
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
      title: data.title,
      description: `${data.title} · LJTian Blog`,
      ...(icons ? { icons } : {}),
    };
  } catch {
    return { title: "文章" };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const { data, content } = post;
  const pageId =
    typeof data.page_id === "string" && data.page_id.trim()
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
    usedNotion && recordMap && pageId
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

  const showPostHeader = Boolean(notionLead || data.published_at);

  return (
    <div className="blog-post-page">
      <BlogProfileHero
        coverUrl={notionHero?.coverUrl}
        iconUrl={notionHero?.iconUrl}
        iconEmoji={notionHero?.iconEmoji}
        title={notionHero?.title ?? data.title}
        headingTitle={data.title}
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
            {data.published_at ? (
              <p className="post-meta">
                <time dateTime={data.published_at}>{data.published_at}</time>
              </p>
            ) : null}
          </header>
        ) : null}
        {usedNotion && recordMapForBody ? (
          <NotionBlogBody
            recordMap={recordMapForBody}
            pageUrlByNotionId={pageUrlByNotionId}
            rootNotionPageId={pageId}
            blogSlug={slug}
          />
        ) : (
          <div
            className="post-body post-prose"
            dangerouslySetInnerHTML={{
              __html: await markdownToHtml(content.trim()),
            }}
          />
        )}
      </article>
    </main>
    </div>
  );
}
