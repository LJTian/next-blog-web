"use client";

import type { BookPage } from "@/lib/content";

type StaticBookFallbackProps = {
  pages: BookPage[];
  index: number;
  visible?: boolean;
};

export default function StaticBookFallback({ pages, index, visible = false }: StaticBookFallbackProps) {
  const page = pages[index];

  return (
    <article className={visible ? "static-book static-book--visible" : "static-book"} aria-live="polite">
      <div className={`static-book__page static-book__page--${page.kind}`}>
        <p>{page.kind}</p>
        <h2>{page.title}</h2>
        {"subtitle" in page ? <span>{page.subtitle}</span> : null}
        {"entries" in page
          ? page.entries.map((entry) => (
              <span key={entry.title}>
                {entry.title} / {entry.meta}
              </span>
            ))
          : null}
        {"topics" in page ? <span>{page.topics.join(" / ")}</span> : null}
        {"body" in page ? <span>{page.body}</span> : null}
        {"action" in page ? <button type="button">{page.action}</button> : null}
      </div>
    </article>
  );
}
