"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { BlogTocAside } from "@/components/BlogTocAside";
import type { NotionTocItem } from "@/lib/notionToc";

type Props = {
  children: ReactNode;
  tocItems: NotionTocItem[];
};

/**
 * 测量 `.post-header` 底边（导语区下横线）相对本容器的偏移，供侧栏 `top` 与横线对齐。
 */
export function BlogPostTocLayoutClient({ children, tocItems }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const layout = ref.current;
    if (!layout) return;

    const sync = () => {
      const header = layout.querySelector(".post-header");
      if (!(header instanceof HTMLElement)) {
        layout.style.setProperty("--blog-toc-top", "0px");
        return;
      }
      const layoutRect = layout.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const topPx = headerRect.bottom - layoutRect.top;
      layout.style.setProperty("--blog-toc-top", `${Math.max(0, Math.round(topPx * 100) / 100)}px`);
    };

    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(layout);
    const article = layout.querySelector(".post-article");
    if (article instanceof HTMLElement) ro.observe(article);
    const header = layout.querySelector(".post-header");
    if (header instanceof HTMLElement) ro.observe(header);

    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <div ref={ref} className="blog-post-toc-layout blog-post-toc-layout--with-toc">
      <BlogTocAside items={tocItems} />
      {children}
    </div>
  );
}
