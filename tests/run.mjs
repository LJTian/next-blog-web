import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";

import { normalizeNotionMarkdown } from "../lib/notionMarkdownNormalize.js";
import { getAllPosts, getAllSlugs, getPostBySlug } from "../lib/posts.js";
import { formatNotionId } from "../scripts/sync-notion.mjs";

function test(name, fn) {
  try {
    fn();
    console.log("ok", name);
  } catch (e) {
    console.error("fail", name);
    throw e;
  }
}

test("formatNotionId adds dashes to 32-char hex", () => {
  assert.strictEqual(
    formatNotionId("ce8a73f53641460cb4ba5f92596ae14b"),
    "ce8a73f5-3641-460c-b4ba-5f92596ae14b",
  );
});

test("formatNotionId leaves dashed uuid unchanged shape", () => {
  assert.strictEqual(
    formatNotionId("ce8a73f5-3641-460c-b4ba-5f92596ae14b"),
    "ce8a73f5-3641-460c-b4ba-5f92596ae14b",
  );
});

test("getAllSlugs and getPostBySlug read frontmatter from markdown files", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "next-blog-posts-"));
  const postsDir = path.join(tmp, "content", "posts");
  fs.mkdirSync(postsDir, { recursive: true });
  const body = `---
title: "Hello"
slug: "hello"
page_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
published_at: "2026-05-01"
---

# Hi

World.
`;
  fs.writeFileSync(path.join(postsDir, "hello.md"), body, "utf8");

  assert.deepStrictEqual(getAllSlugs(tmp), ["hello"]);
  const post = getPostBySlug("hello", tmp);
  assert.strictEqual(post.data.title, "Hello");
  assert.strictEqual(post.data.slug, "hello");
  assert.strictEqual(post.data.published_at, "2026-05-01");
  assert.ok(/# Hi/.test(post.content));
});

test("normalizeNotionMarkdown un-indents fences and unwraps columns", () => {
  const raw = `intro
<columns>
\t<column>
\t\t\`\`\`c
int x;
\t\t\`\`\`
\t</column>
</columns>`;
  const out = normalizeNotionMarkdown(raw);
  assert.ok(out.includes("```c"), "opening fence at column 0");
  assert.ok(!out.includes("<column>"), "column tags removed");
  assert.ok(out.includes("int x;"));
});

test("normalizeNotionMarkdown dedents page links so they are not code blocks", () => {
  const raw = `<columns>
\t<column>
\t\t<page url="https://www.notion.so/x">关于我</page>
\t</column>
</columns>`;
  const out = normalizeNotionMarkdown(raw);
  assert.ok(out.includes("[关于我](https://www.notion.so/x)"));
  assert.ok(!/^\t/.test(out.split("\n").find((l) => l.includes("关于我")) ?? ""));
});

test("getAllPosts sorts by published_at descending", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "next-blog-list-"));
  const postsDir = path.join(tmp, "content", "posts");
  fs.mkdirSync(postsDir, { recursive: true });

  fs.writeFileSync(
    path.join(postsDir, "older.md"),
    `---
title: "Older"
slug: "older"
published_at: "2026-01-01"
---
x`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(postsDir, "newer.md"),
    `---
title: "Newer"
slug: "newer"
published_at: "2026-06-01"
---
y`,
    "utf8",
  );

  const list = getAllPosts(tmp);
  assert.strictEqual(list.length, 2);
  assert.strictEqual(list[0].slug, "newer");
  assert.strictEqual(list[1].slug, "older");
});

console.log("All tests passed.");
