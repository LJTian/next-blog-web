"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import type { BlogFabNavItem } from "@/lib/blogFabNavTypes";

/** 与 `app/page.tsx` 重定向一致：博客首页（文章列表） */
const BLOG_HOME = "/blog";

function isBlogHomePath(pathname: string): boolean {
  const base = pathname.replace(/\/$/, "") || "/";
  return base === BLOG_HOME;
}

type Props = {
  categories: BlogFabNavItem[];
};

/**
 * 右下角导航：悬停或点击展开分类列表，底部为返回门户首页。
 */
export function BlogHomeFab({ categories }: Props) {
  const pathname = usePathname();
  const [hover, setHover] = useState(false);
  const [tapOpen, setTapOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const open = hover || tapOpen;

  useEffect(() => {
    if (!tapOpen) return;
    const onDocClick = (e: Event) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setTapOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [tapOpen]);

  const onTriggerClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setHover(false);
    setTapOpen((v) => !v);
  }, []);

  const closeMenu = useCallback(() => setTapOpen(false), []);

  if (isBlogHomePath(pathname)) {
    return null;
  }

  return (
    <div
      ref={wrapRef}
      className={`blog-home-fab-wrap${open ? " blog-home-fab-wrap--open" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        className="blog-home-fab"
        id="blog-home-fab-trigger"
        aria-label={open ? "收起日志分类与返回首页" : "展开日志分类与返回首页"}
        aria-expanded={open}
        aria-controls="blog-home-fab-menu"
        aria-haspopup="true"
        onClick={onTriggerClick}
      >
        <span className="blog-home-fab-icon" aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </span>
        <span className="blog-home-fab-label">导航</span>
        <span className="blog-home-fab-caret" aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      <nav
        id="blog-home-fab-menu"
        className="blog-home-fab-panel"
        aria-label="日志分类"
        hidden={!open}
      >
        <ul className="blog-home-fab-list">
          {categories.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="blog-home-fab-link" onClick={closeMenu}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
        <div className="blog-home-fab-panel-divider" aria-hidden />
        <Link href={BLOG_HOME} className="blog-home-fab-home" onClick={closeMenu}>
          返回首页
        </Link>
      </nav>
    </div>
  );
}
