import { redirect, notFound } from "next/navigation";

import { normalizeNotionPageId, NOTION_PAGE_ID_HEX32 } from "@/lib/notionPageId";
import { getNotionPageIdToBlogHref } from "@/lib/notionPageLinks";

/** 处理书签 / 外链中的 `/{32位hex}`，映射到 `/blog/{slug}` */
export const dynamicParams = true;

export function generateStaticParams() {
  const map = getNotionPageIdToBlogHref();
  return Object.keys(map).map((pageId) => ({ pageId }));
}

export default async function NotionPageIdRedirect({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId: raw } = await params;
  const norm = normalizeNotionPageId(raw);
  if (!NOTION_PAGE_ID_HEX32.test(norm)) {
    notFound();
  }
  const href = getNotionPageIdToBlogHref()[norm];
  if (!href) {
    notFound();
  }
  redirect(href);
}
