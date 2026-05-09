import type { ExtendedRecordMap } from "notion-types";
import {
  defaultMapImageUrl,
  getBlockIcon,
  getBlockTitle,
  getBlockValue,
  isUrl,
  parsePageId,
} from "notion-utils";

export type NotionPageHeroAssets = {
  coverUrl: string | null;
  iconUrl: string | null;
  iconEmoji: string | null;
  title: string;
};

/** 从当前页的 recordMap 读取 Notion「封面」与「页面图标」（含 emoji / 上传图 / icons） */
export function getNotionPageHeroAssets(
  recordMap: ExtendedRecordMap,
  pageId: string,
  darkMode = false,
): NotionPageHeroAssets | null {
  const uuid = parsePageId(pageId.trim());
  if (!uuid) return null;

  const raw =
    recordMap.block[uuid] ??
    recordMap.block[uuid.replace(/-/g, "")];
  const block = getBlockValue(raw);
  if (!block || block.type !== "page") return null;

  const coverRaw = block.format?.page_cover;
  const coverUrl = coverRaw
    ? (defaultMapImageUrl(coverRaw, block) ?? null)
    : null;

  const iconRaw = getBlockIcon(block, recordMap)?.trim() ?? null;
  let iconUrl: string | null = null;
  let iconEmoji: string | null = null;
  if (iconRaw) {
    if (isUrl(iconRaw)) {
      iconUrl = defaultMapImageUrl(iconRaw, block) ?? null;
    } else if (iconRaw.startsWith("/icons/")) {
      iconUrl = `https://www.notion.so${iconRaw}?mode=${darkMode ? "dark" : "light"}`;
    } else {
      iconEmoji = iconRaw;
    }
  }

  const title = getBlockTitle(block, recordMap)?.trim() || "LJTian Blog";

  return { coverUrl, iconUrl, iconEmoji, title };
}
