import type { ExtendedRecordMap } from "notion-types";
import { getBlockValue, getTextContent, parsePageId } from "notion-utils";

/** 可作为「标题下导语」提升的块（不含 header，避免与 h1 重复） */
const LEAD_BLOCK_TYPES = new Set(["text", "quote", "callout"]);

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

/**
 * 取页面顶层第一个可展示的导语块纯文本（用于放在文章标题与分割线之间）。
 */
export function extractNotionLeadParagraph(
  recordMap: ExtendedRecordMap,
  pageId: string,
): { plainText: string; blockKey: string } | null {
  const uuid = parsePageId(pageId.trim());
  if (!uuid) return null;

  const pageKey = resolveBlockKey(recordMap.block, uuid);
  if (!pageKey) return null;

  const page = getBlockValue(recordMap.block[pageKey]);
  if (!page || page.type !== "page" || !Array.isArray(page.content)) {
    return null;
  }

  for (const cid of page.content) {
    const bKey = resolveBlockKey(recordMap.block, cid);
    if (!bKey) continue;
    const b = getBlockValue(recordMap.block[bKey]);
    if (!b || !b.alive) continue;
    if (!LEAD_BLOCK_TYPES.has(b.type)) continue;
    const title = b.properties?.title;
    const plain = title ? getTextContent(title).trim() : "";
    if (!plain) continue;
    return { plainText: plain, blockKey: bKey };
  }

  return null;
}

/**
 * 从 recordMap 中移除顶层块（用于导语已单独渲染，避免正文重复）。
 */
export function recordMapWithoutTopLevelBlock(
  recordMap: ExtendedRecordMap,
  pageId: string,
  omitBlockKey: string,
): ExtendedRecordMap {
  const next = structuredClone(recordMap) as ExtendedRecordMap;
  const pageKey = resolveBlockKey(next.block, pageId);
  if (!pageKey) return recordMap;

  const page = getBlockValue(next.block[pageKey]);
  if (!page || page.type !== "page" || !Array.isArray(page.content)) {
    return recordMap;
  }

  const omitNorm = omitBlockKey.replace(/-/g, "").toLowerCase();
  page.content = page.content.filter(
    (cid: string) => cid.replace(/-/g, "").toLowerCase() !== omitNorm,
  );

  const omitStored = resolveBlockKey(next.block, omitBlockKey);
  if (omitStored) delete next.block[omitStored];

  return next;
}
