import type { Decoration, ExtendedRecordMap } from "notion-types";
import { getBlockValue, getTextContent } from "notion-utils";

/** 集合在 Notion 中的原名 → 站点展示名 */
const COLLECTION_TITLE_BY_SOURCE: Record<string, string> = {
  "Blog Posts": "分类",
};

/**
 * 覆盖嵌入数据库（collection）在页面上的标题文案，无需改 Notion 里数据库名称。
 */
export function applyNotionCollectionTitleOverrides(
  recordMap: ExtendedRecordMap,
): void {
  const map = recordMap.collection;
  if (!map) return;

  for (const id of Object.keys(map)) {
    const collection = getBlockValue(map[id]);
    if (!collection?.name?.length) continue;
    const plain = getTextContent(collection.name).trim();
    const replacement = COLLECTION_TITLE_BY_SOURCE[plain];
    if (!replacement) continue;
    collection.name = [[replacement]] as Decoration[];
  }
}
