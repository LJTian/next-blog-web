import { Client } from "@notionhq/client";
import { NotionCompatAPI } from "notion-compat";

let cached: NotionCompatAPI | null = null;

export function getNotionCompatApi(): NotionCompatAPI | null {
  const auth = process.env.NOTION_API_KEY?.trim();
  if (!auth) return null;
  if (!cached) {
    cached = new NotionCompatAPI(new Client({ auth }));
  }
  return cached;
}
