import type { NotionTocItem } from "@/lib/notionToc";

type Props = {
  items: NotionTocItem[];
};

export function BlogTocAside({ items }: Props) {
  if (!items.length) return null;

  return (
    <aside className="blog-toc-aside" aria-label="文章目录">
      <nav className="blog-toc-nav">
        <div className="blog-toc-heading">
          <span className="blog-toc-heading-label">Table of Contents</span>
          <span className="blog-toc-heading-cn">目录</span>
        </div>
        <ul className="blog-toc-list">
          {items.map((item) => (
            <li
              key={item.anchorId}
              className={`blog-toc-item blog-toc-item--depth-${item.depth}`}
            >
              <a href={`#${item.anchorId}`} className="blog-toc-link">
                <span className="blog-toc-link-text">{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
