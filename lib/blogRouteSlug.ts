/**
 * 统一动态路由 `[slug]` 与 `siteCategories.slug`、Markdown 文件名的比较方式。
 * 处理：段内仍带百分号编码、Unicode 归一化（NFC）。
 */
export function normalizeBlogRouteSlug(raw: string): string {
  let s = (raw ?? "").trim();
  if (!s) return s;
  try {
    if (s.includes("%")) {
      s = decodeURIComponent(s);
    }
  } catch {
    /* 非法编码则保留原串 */
  }
  return s.normalize("NFC");
}
