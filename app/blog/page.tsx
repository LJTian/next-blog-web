import {
  BlogPostPageView,
  generateBlogPostPageMetadata,
} from "@/components/BlogPostPageView";
import { BLOG_PORTAL_SLUG } from "@/lib/blogPortal";

export const revalidate = 60;

export async function generateMetadata() {
  return generateBlogPostPageMetadata(BLOG_PORTAL_SLUG);
}

/** 博客门户首页：原 `/blog/ljtian-blog` 内容，路径为 `/blog` */
export default function BlogPortalPage() {
  return <BlogPostPageView slug={BLOG_PORTAL_SLUG} />;
}
