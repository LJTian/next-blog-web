"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { NotionRenderer } from "react-notion-x";
import type { ExtendedRecordMap } from "notion-types";

import { NotionPrismRefresh } from "@/components/NotionPrismRefresh";

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
};

export function NotionBlogBody({ recordMap }: Props) {
  return (
    <div className="notion-blog-root notion-blog-themed">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={false}
        disableHeader
        showTableOfContents={false}
        className="notion-dynamic-renderer"
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
