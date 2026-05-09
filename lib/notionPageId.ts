/** Notion / react-notion-x 页面 ID：无短横线、32 位十六进制 */
export const NOTION_PAGE_ID_HEX32 = /^[0-9a-f]{32}$/i;

export function normalizeNotionPageId(pageId: string): string {
  return (pageId || "").replace(/-/g, "").toLowerCase();
}
