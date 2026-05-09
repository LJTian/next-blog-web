/**
 * 可选静默 Notion 相关控制台输出。
 * 在 `.env.local` 中设置 `NOTION_LOG=quiet`（或 `0`）可关闭非致命 warn（如公开 API 首次失败提示）。
 * 客户端 Prism 高亮失败提示受 `NEXT_PUBLIC_NOTION_LOG` 控制，同上。
 */
export function notionLogEnabled(): boolean {
  const v = process.env.NOTION_LOG;
  return v !== "quiet" && v !== "0" && v !== "false";
}

export function notionDevWarn(...args: unknown[]): void {
  if (!notionLogEnabled()) return;
  console.warn(...args);
}

/** 浏览器端：构建期注入 NEXT_PUBLIC_NOTION_LOG */
export function notionClientWarn(...args: unknown[]): void {
  const v = process.env.NEXT_PUBLIC_NOTION_LOG;
  if (v === "quiet" || v === "0" || v === "false") return;
  console.warn(...args);
}
