import type { ExtendedRecordMap } from "notion-types";
import {
  getBlockValue,
  getPageTableOfContents,
  parsePageId,
  uuidToId,
} from "notion-utils";

function resolveBlockKey(
  blockMap: ExtendedRecordMap["block"],
  id: string,
): string | null {
  const n = id.replace(/-/g, "").toLowerCase();
  for (const k of Object.keys(blockMap)) {
    if (k.replace(/-/g, "").toLowerCase() === n) return k;
  }
  return null;
}

export type NotionTocItem = {
  /** 与正文 `.notion-header-anchor` 的 id 一致（无短横线 32 位 hex） */
  anchorId: string;
  text: string;
  depth: number;
};

/** 从 Notion recordMap 提取标题目录（与 react-notion-x 标题锚点一致） */
export function getNotionTocFromRecordMap(
  recordMap: ExtendedRecordMap,
  pageId: string,
): NotionTocItem[] {
  const uuid = parsePageId(pageId.trim());
  if (!uuid) return [];

  const pageKey = resolveBlockKey(recordMap.block, uuid);
  if (!pageKey) return [];

  const page = getBlockValue(recordMap.block[pageKey]);
  if (!page || page.type !== "page" || !Array.isArray(page.content)) {
    return [];
  }

  const toc = getPageTableOfContents(page, recordMap);
  if (!toc.length) return [];

  return toc.map((item) => ({
    anchorId: uuidToId(item.id),
    text: (item.text || "").trim() || "·",
    depth: Math.min(Math.max(item.indentLevel, 0), 5),
  }));
}
