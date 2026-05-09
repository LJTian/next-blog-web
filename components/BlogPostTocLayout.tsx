import type { ReactNode } from "react";

import { BlogPostTocLayoutClient } from "@/components/BlogPostTocLayoutClient";
import type { NotionTocItem } from "@/lib/notionToc";

type Props = {
  children: ReactNode;
  tocItems: NotionTocItem[];
};

/** 有目录时：左侧 sticky 目录 + 主栏（目录顶与导语区下横线对齐）；无目录时：仅渲染子节点 */
export function BlogPostTocLayout({ children, tocItems }: Props) {
  if (!tocItems.length) {
    return <>{children}</>;
  }

  return <BlogPostTocLayoutClient tocItems={tocItems}>{children}</BlogPostTocLayoutClient>;
}
