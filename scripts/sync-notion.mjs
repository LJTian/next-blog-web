import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = process.env.NOTION_VERSION ?? "2026-03-11";

const NOTION_LOG_QUIET =
  process.env.NOTION_LOG === "quiet" ||
  process.env.NOTION_LOG === "0" ||
  process.env.NOTION_LOG === "false";

function syncLog(...args) {
  if (NOTION_LOG_QUIET) return;
  console.log(...args);
}

function syncWarn(...args) {
  if (NOTION_LOG_QUIET) return;
  console.warn(...args);
}

/** Phase 1 fallback when NOTION_POSTS_DATA_SOURCE_ID is unset */
const STATIC_POSTS = [
  {
    title: "LJTian Blog",
    slug: "ljtian-blog",
    pageId: "ce8a73f53641460cb4ba5f92596ae14b",
    published_at: null,
  },
  {
    title: "关于我",
    slug: "about-me",
    pageId: "0ce2fc2b4be744159b7083a53f9da3d9",
    published_at: null,
  },
  {
    title: "关于博客",
    slug: "about-blog",
    pageId: "8eb21be2f7e147a9a4703622664aabd5",
    published_at: null,
  },
];

export function formatNotionId(id) {
  const raw = String(id).replace(/-/g, "").trim();
  if (raw.length !== 32 || !/^[a-f0-9]+$/i.test(raw)) {
    return String(id).trim();
  }
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function slugifyTitle(s) {
  return (
    String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\u4e00-\u9fff-]/g, "")
      .slice(0, 96) || "post"
  );
}

function getTitleProp(properties, name) {
  const p = properties[name];
  if (!p || p.type !== "title") return "";
  return (p.title ?? []).map((t) => t.plain_text).join("");
}

function getRichTextProp(properties, name) {
  const p = properties[name];
  if (!p || p.type !== "rich_text") return "";
  return (p.rich_text ?? []).map((t) => t.plain_text).join("");
}

function getDateProp(properties, name) {
  const p = properties[name];
  if (!p || p.type !== "date") return null;
  return p.date?.start ?? null;
}

async function notionFetch(method, pathname, body) {
  const res = await fetch(`https://api.notion.com${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Notion API ${method} ${pathname} failed ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function fetchMarkdownFragment(pageId) {
  const id = encodeURIComponent(formatNotionId(pageId));
  let res;
  try {
    res = await fetch(`https://api.notion.com/v1/pages/${id}/markdown`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
      },
    });
  } catch (e) {
    throw new Error(`Markdown fetch network error for ${pageId}: ${e}`);
  }
  const text = await res.text();
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Markdown fetch failed ${res.status} for ${pageId}: ${text}`);
  }
  return JSON.parse(text);
}

async function fetchFullPageMarkdown(rootPageId) {
  const root = await fetchMarkdownFragment(rootPageId);
  if (!root) {
    throw new Error(`No markdown for root page ${rootPageId} (404 or missing)`);
  }
  let markdown = root.markdown ?? "";
  const queue = [...(root.unknown_block_ids ?? [])];
  const seen = new Set([formatNotionId(rootPageId)]);

  while (queue.length) {
    const bid = queue.shift();
    const fid = formatNotionId(bid);
    if (seen.has(fid)) continue;
    seen.add(fid);

    let sub;
    try {
      sub = await fetchMarkdownFragment(bid);
    } catch (e) {
      syncWarn(`Skipping markdown subtree ${bid}: ${e.message}`);
      continue;
    }
    if (!sub) {
      syncWarn(`Skipping inaccessible or missing block/page ${bid}`);
      continue;
    }
    if (sub.markdown) {
      markdown += markdown.endsWith("\n") ? "\n" : "\n\n";
      markdown += sub.markdown;
    }
    for (const id of sub.unknown_block_ids ?? []) {
      const nf = formatNotionId(id);
      if (!seen.has(nf)) queue.push(id);
    }
  }

  return markdown;
}

function mapPageToPost(page, env) {
  const propTitle = env.NOTION_PROP_TITLE ?? "title";
  const propSlug = env.NOTION_PROP_SLUG ?? "slug";
  const propPublishedAt = env.NOTION_PROP_PUBLISHED_AT ?? "published_at";

  const title = getTitleProp(page.properties, propTitle).trim() || "Untitled";
  let slug = getRichTextProp(page.properties, propSlug).trim();
  if (!slug) {
    slug = `${slugifyTitle(title)}-${formatNotionId(page.id).slice(0, 8)}`;
  }
  const published_at = getDateProp(page.properties, propPublishedAt);

  return {
    title,
    slug,
    pageId: page.id,
    published_at,
  };
}

async function queryPublishedPosts(dataSourceId, env = process.env) {
  const propStatus = env.NOTION_PROP_STATUS ?? "status";
  const publishedValue = env.NOTION_STATUS_PUBLISHED_VALUE ?? "published";

  const filter = {
    property: propStatus,
    select: { equals: publishedValue },
  };

  const posts = [];
  let cursor = undefined;

  do {
    const body = {
      filter,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    };
    const json = await notionFetch(
      "POST",
      `/v1/data_sources/${encodeURIComponent(dataSourceId)}/query`,
      body,
    );
    for (const page of json.results ?? []) {
      if (page.object !== "page") continue;
      posts.push(mapPageToPost(page, env));
    }
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);

  posts.sort((a, b) => {
    const da = a.published_at ?? "";
    const db = b.published_at ?? "";
    return db.localeCompare(da);
  });

  return posts;
}

async function resolvePosts() {
  const dsId = process.env.NOTION_POSTS_DATA_SOURCE_ID?.trim();
  if (dsId) {
    syncLog("Using Notion data source:", dsId);
    return queryPublishedPosts(dsId);
  }
  syncLog("Using static posts list (set NOTION_POSTS_DATA_SOURCE_ID for DB sync).");
  return STATIC_POSTS;
}

function buildFrontmatter(post) {
  const lines = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    `slug: ${JSON.stringify(post.slug)}`,
    `page_id: ${JSON.stringify(formatNotionId(post.pageId))}`,
    `published_at: ${post.published_at === null || post.published_at === undefined ? "null" : JSON.stringify(post.published_at)}`,
    "---",
    "",
  ];
  return lines.join("\n");
}

async function clearMarkdownFiles(outDir) {
  let names;
  try {
    names = await fs.readdir(outDir);
  } catch {
    return;
  }
  await Promise.all(
    names
      .filter((n) => n.endsWith(".md"))
      .map((n) => fs.unlink(path.join(outDir, n))),
  );
}

async function main() {
  if (!NOTION_API_KEY?.trim()) {
    console.error("Missing NOTION_API_KEY.");
    process.exit(1);
  }

  const outDir = path.join(process.cwd(), "content", "posts");
  await fs.mkdir(outDir, { recursive: true });
  await clearMarkdownFiles(outDir);

  const posts = await resolvePosts();
  if (!posts.length) {
    console.error("No posts to sync.");
    process.exit(1);
  }

  for (const post of posts) {
    const markdownBody = await fetchFullPageMarkdown(post.pageId);
    const fileContent = buildFrontmatter(post) + markdownBody;
    const filePath = path.join(outDir, `${post.slug}.md`);
    await fs.writeFile(filePath, fileContent, "utf8");
    syncLog("Wrote", path.relative(process.cwd(), filePath));
  }

  syncLog("Notion sync done.");
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
