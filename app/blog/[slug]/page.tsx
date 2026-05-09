import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogProfileHero } from "@/components/BlogProfileHero";
import { NotionBlogBody } from "@/components/NotionBlogBody";
import { fetchNotionPageRecordMap } from "@/lib/fetchNotionRecordMap";
import { getNotionPageHeroAssets } from "@/lib/notionPageHero";
import { markdownToHtml } from "@/lib/markdown";
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
    return {
      title: data.title,
      description: `${data.title} · LJTian Blog`,
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
  let notionSource: "public-notion-client" | "official-compat" | null = null;

  if (pageId) {
    try {
      const fetched = await fetchNotionPageRecordMap(pageId);
      if (fetched) {
        recordMap = fetched.recordMap;
        notionSource = fetched.source;
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

  return (
    <>
      <BlogProfileHero
        coverUrl={notionHero?.coverUrl}
        iconUrl={notionHero?.iconUrl}
        iconEmoji={notionHero?.iconEmoji}
        title={notionHero?.title ?? data.title}
      />
      <main className="blog-main blog-main-wide">
      <article className="post-article">
        <header className="post-header">
          <h1 className="post-title">{data.title}</h1>
          {data.published_at ? (
            <p className="post-meta">
              <time dateTime={data.published_at}>{data.published_at}</time>
            </p>
          ) : null}
          {usedNotion ? (
            <p className="post-source-hint notion-live">
              {notionSource === "public-notion-client"
                ? "Notion 公开页渲染（ISR 约 60s）"
                : "Notion Integration 兜底渲染（嵌入库可能不全）"}
            </p>
          ) : (
            <p className="post-source-hint markdown-fallback">
              {!pageId
                ? "frontmatter 缺少 page_id，使用本地 Markdown。"
                : !process.env.NOTION_API_KEY?.trim()
                  ? "公开页拉取失败且未配置 NOTION_API_KEY；请发布页面或配置密钥兜底。"
                  : "Notion 拉取失败，已用本地 Markdown。"}
            </p>
          )}
        </header>
        {usedNotion && recordMap ? (
          <NotionBlogBody recordMap={recordMap} />
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
    </>
  );
}
