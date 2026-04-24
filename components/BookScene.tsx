"use client";

import { useEffect, useRef, useState } from "react";
import { bookPages, type BookPage } from "@/lib/content";

const sectionEyebrow: Record<BookPage["kind"], string> = {
  cover: "Opening",
  featured: "Featured",
  topics: "Topics",
  about: "About",
  archive: "Archive"
};

function PageContent({ page, muted = false }: { page: BookPage; muted?: boolean }) {
  return (
    <div className={muted ? "real-book__content real-book__content--muted" : "real-book__content"}>
      <p className="real-book__eyebrow">{sectionEyebrow[page.kind]}</p>
      <h2>{page.title}</h2>
      {"subtitle" in page ? <p className="real-book__lede">{page.subtitle}</p> : null}
      {"entries" in page ? (
        <ul className="real-book__list">
          {page.entries.map((entry) => (
            <li key={entry.title}>
              <span className="real-book__list-title">{entry.title}</span>
              <span className="real-book__list-meta">{entry.meta}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {"topics" in page ? (
        <ul className="real-book__chips">
          {page.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      ) : null}
      {"body" in page && !("action" in page) ? <p className="real-book__body">{page.body}</p> : null}
      {"action" in page ? (
        <p className="real-book__action">
          <span>{page.body}</span>
          <span className="real-book__action-cta">{page.action}</span>
        </p>
      ) : null}
    </div>
  );
}

function BlankPage() {
  return (
    <div className="real-book__content real-book__content--blank">
      <p className="real-book__eyebrow">End</p>
      <h2>Notes</h2>
      <p className="real-book__body">The rest of the pages are waiting for the next entry.</p>
    </div>
  );
}

function TurnSheet({
  page,
  backPage,
  direction,
  active
}: {
  page: BookPage;
  backPage?: BookPage;
  direction: "next" | "previous";
  active: boolean;
}) {
  const className = `real-book__turn-sheet real-book__turn-sheet--${direction}${active ? " real-book__turn-sheet--active" : ""}`;

  return (
    <div className={className} aria-hidden="true">
      {/* 动态落点阴影：翻页时投射在下方静态页上的阴影 */}
      <div className="real-book__turn-shadow" />

      <div className="real-book__turn-face real-book__turn-face--front">
        <PageContent page={page} muted />
        {/* 翻页内光影：模拟弯曲时的暗部 */}
        <div className="real-book__page-shine" />
      </div>

      <div className="real-book__turn-face real-book__turn-face--back">
        {backPage ? <PageContent page={backPage} muted /> : <BlankPage />}
        <div className="real-book__page-shine" />
      </div>
    </div>
  );
}

export default function BookScene() {
  const [pageIndex, setPageIndex] = useState(0);
  const [turning, setTurning] = useState<"next" | "previous" | null>(null);
  const turnTimerRef = useRef<number | null>(null);

  const canGoBack = pageIndex > 0;
  const canGoNext = pageIndex < bookPages.length - 2;

  const leftPage = bookPages[pageIndex];
  const rightPage = bookPages[pageIndex + 1];

  // 动态计算堆叠比例（0 到 1 之间）
  const progress = pageIndex / (bookPages.length - 2);

  useEffect(() => {
    return () => {
      if (turnTimerRef.current !== null) {
        window.clearTimeout(turnTimerRef.current);
      }
    };
  }, []);

  function finishTurn(direction: "next" | "previous") {
    if (turnTimerRef.current !== null) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }

    setTurning(direction);
    turnTimerRef.current = window.setTimeout(() => {
      setPageIndex((value) => {
        if (direction === "next") {
          return Math.min(bookPages.length - 1, value + 2);
        }
        return Math.max(0, value - 2);
      });
      setTurning(null);
      turnTimerRef.current = null;
    }, 820);
  }

  return (
    <div className="book-scene">
      <div
        className={`real-book real-book--large ${
          turning === "next" ? "real-book--turning-next" : turning === "previous" ? "real-book--turning-previous" : ""
        }`}
        style={{ "--book-progress": progress } as React.CSSProperties}
        aria-label="Realistic open book"
      >
        <div className="real-book__spread">
          <button
            aria-label="Turn to previous page"
            className="real-book__page real-book__page--left"
            disabled={!canGoBack || turning !== null}
            onClick={() => finishTurn("previous")}
            type="button"
          >
            {/* 增加越界检查，避免 crash */}
            {turning === "previous" && pageIndex >= 2 ? (
              <PageContent page={bookPages[pageIndex - 2]} />
            ) : (
              <PageContent page={leftPage} />
            )}
            <div className="real-book__edge-stack" />
          </button>
          <button
            aria-label="Turn to next page"
            className="real-book__page real-book__page--right"
            disabled={!canGoNext || turning !== null}
            onClick={() => finishTurn("next")}
            type="button"
          >
            {turning === "next" && bookPages[pageIndex + 3] ? (
              <PageContent page={bookPages[pageIndex + 3]} />
            ) : rightPage ? (
              <PageContent page={rightPage} />
            ) : (
              <BlankPage />
            )}
            <div className="real-book__edge-stack" />
            <span className="real-book__page-lines" />
          </button>

          <div className="real-book__gutter" />

          {/* 修正逻辑：
              Next: 正在翻动的是右页(front)，背面是新左页(back)
              Previous: 正在翻动的是左页(front)，背面是新右页(back)
          */}
          {turning === "next" && (
            <TurnSheet active={true} direction="next" page={rightPage} backPage={bookPages[pageIndex + 2]} />
          )}
          {turning === "previous" && (
            <TurnSheet active={true} direction="previous" page={leftPage} backPage={bookPages[pageIndex - 1]} />
          )}
        </div>
      </div>
    </div>
  );
}
