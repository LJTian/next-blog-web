import Link from "next/link";

import { BlogProfileHero } from "@/components/BlogProfileHero";
import { getAllPosts } from "@/lib/posts";

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <BlogProfileHero />
      <main className="blog-main">
      <header className="blog-index-head">
        <div className="blog-heading-row">
          <h1 className="blog-heading">文章</h1>
          {posts.length > 0 ? (
            <span className="blog-count-pill">{posts.length} 篇</span>
          ) : null}
        </div>
        <p className="blog-lead">
          以下是已从 Notion 同步的文章；排版含语法高亮与移动端可读优化。
        </p>
      </header>
      {posts.length === 0 ? (
        <div className="blog-empty-card">
          <p className="blog-empty">
            暂无文章。请在本地设置 <code>NOTION_API_KEY</code> 后运行{" "}
            <code>npm run sync:notion</code>，或在 Vercel 构建时自动生成。
          </p>
        </div>
      ) : (
        <>
          <h2 className="tb-feed-heading">Blog Posts</h2>
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <article>
                  <Link
                    className="post-list-link"
                    href={`/blog/${post.slug}`}
                    suppressHydrationWarning
                  >
                    <div className="post-list-main">
                      <h2 className="post-list-title">{post.title}</h2>
                      <span className="post-list-arrow" aria-hidden>
                        →
                      </span>
                    </div>
                    {post.published_at ? (
                      <time
                        className="post-list-date"
                        dateTime={post.published_at}
                      >
                        {post.published_at}
                      </time>
                    ) : (
                      <span className="post-list-date post-list-date-missing">
                        日期待定
                      </span>
                    )}
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
    </>
  );
}
