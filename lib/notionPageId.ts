/** Notion / react-notion-x 页面 ID：无短横线、32 位十六进制 */
export const NOTION_PAGE_ID_HEX32 = /^[0-9a-f]{32}$/i;

export function normalizeNotionPageId(pageId: string): string {
  return (pageId || "").replace(/-/g, "").toLowerCase();
}

/**
 * 从粘贴内容中解析 32 位页面 ID：支持标准 UUID、纯 32 hex，以及 Notion 链接里的 `标题-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`。
 */
export function extractNotionPageIdHex32(input: string): string | null {
  const digits = String(input || "")
    .trim()
    .replace(/[^0-9a-f]/gi, "")
    .toLowerCase();
  if (digits.length < 32) return null;
  const id = digits.slice(-32);
  return NOTION_PAGE_ID_HEX32.test(id) ? id : null;
}

/** 供 Notion API / parsePageId 使用（8-4-4-4-12） */
export function toDashedNotionPageId(hex32: string): string {
  const n = normalizeNotionPageId(hex32);
  if (!NOTION_PAGE_ID_HEX32.test(n)) return hex32.trim();
  return `${n.slice(0, 8)}-${n.slice(8, 12)}-${n.slice(12, 16)}-${n.slice(16, 20)}-${n.slice(20)}`;
}
