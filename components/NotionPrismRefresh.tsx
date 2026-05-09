"use client";

import type { ExtendedRecordMap } from "notion-types";
import Prism from "prismjs";
import { useEffect, useMemo } from "react";

import "@/components/notion-prism-languages";

/** 避免父组件每次传入新对象引用时反复触发高亮（可能与其他 React 更新冲突） */
function recordMapFingerprint(map: ExtendedRecordMap): string {
  const block = map?.block;
  if (!block || typeof block !== "object") return "0";
  const keys = Object.keys(block);
  if (keys.length === 0) return "0";
  return `${keys.length}:${keys[0] ?? ""}:${keys.at(-1) ?? ""}`;
}

/**
 * react-notion-x 的 Code 在 useEffect([codeRef]) 里高亮，且 Prism 改写的 DOM
 * 可能被后续 React 提交覆盖。在浏览器提交后再执行 highlight。
 * 使用 useEffect（不用 useLayoutEffect），避免 App Router / 水合阶段告警或异常。
 */
export function NotionPrismRefresh({
  recordMap,
}: {
  recordMap: ExtendedRecordMap;
}) {
  const fp = useMemo(() => recordMapFingerprint(recordMap), [recordMap]);

  useEffect(() => {
    const selector = ".notion-blog-themed pre.notion-code > code[class*='language-']";

    const highlight = () => {
      if (typeof document === "undefined") return;
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        try {
          Prism.highlightElement(el);
        } catch (e) {
          console.warn("[NotionPrismRefresh] highlight failed", e);
        }
      });
    };

    highlight();
    const raf = requestAnimationFrame(highlight);
    const t = window.setTimeout(highlight, 0);
    const t2 = window.setTimeout(highlight, 120);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [fp]);

  return null;
}
