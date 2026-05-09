import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  BlogPostPageView,
  generateBlogPostPageMetadata,
} from "@/components/BlogPostPageView";
import { BLOG_PORTAL_SLUG } from "@/lib/blogPortal";
import { normalizeBlogRouteSlug } from "@/lib/blogRouteSlug";
import { getAllSlugs } from "@/lib/posts";
import { getCategorySlugsForStatic } from "@/lib/siteCategories";

/** ISR：与 starter kit 思路一致，定时重新验证 Notion 公开页内容（秒） */
export const revalidate = 60;

/** 含中文等 slug、未列入 generateStaticParams 的分类页也在运行时解析 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const allPostSlugs = getAllSlugs();
  const postSlugs = allPostSlugs.filter((s) => s !== BLOG_PORTAL_SLUG);
  const categorySlugs = getCategorySlugsForStatic(allPostSlugs);
  return [...postSlugs, ...categorySlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = normalizeBlogRouteSlug(raw);
  return generateBlogPostPageMetadata(slug);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = normalizeBlogRouteSlug(raw);
  if (slug === BLOG_PORTAL_SLUG) {
    redirect("/blog");
  }
  return <BlogPostPageView slug={slug} />;
}
