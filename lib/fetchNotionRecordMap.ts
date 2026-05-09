import type { ExtendedRecordMap } from "notion-types";
import { cache } from "react";

import { applyNotionCollectionTitleOverrides } from "./notionCollectionTitleOverrides";
import { getNotionCompatApi } from "./notionCompat";
import { getNotionPublicApi } from "./notionPublicApi";

export type NotionRecordMapSource =
  | "public-notion-client"
  | "official-compat";

/**
 * 与 [nextjs-notion-starter-kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit) 一致：
 * 1. notion-client 的 NotionAPI **不传 authToken** —— 页面须「发布到网页」。
 * 2. 失败且配置了 NOTION_API_KEY 时 —— notion-compat 兜底（嵌入 child_database 可能不完整）。
 */
async function fetchNotionPageRecordMapUncached(pageId: string): Promise<{
  recordMap: ExtendedRecordMap;
  source: NotionRecordMapSource;
} | null> {
  try {
    const api = getNotionPublicApi();
    const recordMap = await api.getPage(pageId, {
      fetchCollections: true,
      fetchMissingBlocks: true,
    });
    applyNotionCollectionTitleOverrides(recordMap);
    return { recordMap, source: "public-notion-client" };
  } catch (e) {
    console.warn(
      "[notion] public NotionAPI.getPage failed (页面是否已「发布到网页」？):",
      e,
    );
  }

  const compat = getNotionCompatApi();
  if (!compat) return null;

  const recordMap = await compat.getPage(pageId);
  applyNotionCollectionTitleOverrides(recordMap);
  return { recordMap, source: "official-compat" };
}

/** 同请求内 generateMetadata 与页面共用一次拉取 */
export const fetchNotionPageRecordMap = cache(fetchNotionPageRecordMapUncached);
