import { NotionAPI } from "notion-client";

/**
 * 与 [nextjs-notion-starter-kit/lib/notion-api.ts](https://github.com/transitive-bullshit/nextjs-notion-starter-kit/blob/main/lib/notion-api.ts) 一致：
 * 无 authToken，依赖页面已在 Notion 中「发布到网页」，由官方私有接口匿名可读。
 * 可选 NOTION_API_BASE_URL 指向自托管代理（规避区域或风控时使用）。
 */
let cached: NotionAPI | null = null;

export function getNotionPublicApi(): NotionAPI {
  if (!cached) {
    const base = process.env.NOTION_API_BASE_URL?.trim();
    cached = new NotionAPI({
      ...(base ? { apiBaseUrl: base } : {}),
    });
  }
  return cached;
}
