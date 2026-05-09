"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { NotionRenderer } from "react-notion-x";
import type { ExtendedRecordMap } from "notion-types";

import { NotionPrismRefresh } from "@/components/NotionPrismRefresh";
import { normalizeNotionPageId } from "@/lib/notionPageId";

const Code = dynamic(() =>
  import("react-notion-x/third-party/code").then((m) => m.Code),
);
const Collection = dynamic(() =>
  import("react-notion-x/third-party/collection").then((m) => m.Collection),
);
const Equation = dynamic(() =>
  import("react-notion-x/third-party/equation").then((m) => m.Equation),
);
const Pdf = dynamic(
  () => import("react-notion-x/third-party/pdf").then((m) => m.Pdf),
  { ssr: false },
);
const Modal = dynamic(
  () => import("react-notion-x/third-party/modal").then((m) => m.Modal),
  { ssr: false },
);

type Props = {
  recordMap: ExtendedRecordMap;
  /** 规范化（无短横线、小写）的 Notion 页面 ID → `/blog/slug` */
  pageUrlByNotionId: Record<string, string>;
  /** 当前渲染的根页面 ID（dashed 或 raw），用于面包屑等指向「本文」 */
  rootNotionPageId?: string | null;
  /** 当前文章 slug，与 root 组合成 canonical 路径 */
  blogSlug: string;
};

export function NotionBlogBody({
  recordMap,
  pageUrlByNotionId,
  rootNotionPageId,
  blogSlug,
}: Props) {
  const mapPageUrl = useMemo(() => {
    const rootNorm = rootNotionPageId?.trim()
      ? normalizeNotionPageId(rootNotionPageId.trim())
      : "";
    const selfHref = `/blog/${blogSlug}`;
    return (pageId: string) => {
      const norm = normalizeNotionPageId(pageId);
      if (!norm) return selfHref;
      if (rootNorm && norm === rootNorm) return selfHref;
      const mapped = pageUrlByNotionId[norm];
      if (mapped) return mapped;
      // 与 notion-utils 默认一致；已知 slug 由 app/[pageId] 重定向，未知则 404
      return `/${norm}`;
    };
  }, [pageUrlByNotionId, rootNotionPageId, blogSlug]);

  return (
    <div className="notion-blog-root notion-blog-themed">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={false}
        disableHeader
        showTableOfContents={false}
        className="notion-dynamic-renderer"
        mapPageUrl={mapPageUrl}
        components={{
          Code,
          Collection,
          Equation,
          Pdf,
          Modal,
          nextImage: Image,
          nextLink: Link,
        }}
      />
      <NotionPrismRefresh recordMap={recordMap} />
    </div>
  );
}
