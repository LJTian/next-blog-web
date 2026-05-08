import test from "node:test";
import assert from "node:assert/strict";

import {
  getNotionEmbedConfig,
  notionBlogUrl,
  notionEmbedUrl,
} from "../lib/notionConfig.js";

test("uses the Notion embed URL by default", () => {
  const config = getNotionEmbedConfig({});

  assert.equal(config.mode, "embed");
  assert.equal(config.pageUrl, notionBlogUrl);
  assert.equal(config.embedUrl, notionEmbedUrl);
});

test("uses iframe mode when an explicit embed URL is configured", () => {
  const embedUrl = "https://embed.notion.co/example";
  const config = getNotionEmbedConfig({
    NEXT_PUBLIC_NOTION_EMBED_URL: embedUrl,
  });

  assert.equal(config.mode, "embed");
  assert.equal(config.pageUrl, notionBlogUrl);
  assert.equal(config.embedUrl, embedUrl);
});
