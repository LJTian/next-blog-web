import fs from "fs";
import path from "path";

import matter from "gray-matter";

function getPostsDir(cwd) {
  return path.join(cwd, "content", "posts");
}

export function getAllSlugs(cwd = process.cwd()) {
  const dir = getPostsDir(cwd);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getPostBySlug(slug, cwd = process.cwd()) {
  const filePath = path.join(getPostsDir(cwd), `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return {
    ...parsed,
    data: parsed.data,
  };
}

/**
 * 按 `published_at` 降序返回所有 Markdown 文章的列表元数据。
 * 当前应用路由以 `/blog` 门户与 Notion 为主，本函数暂无页面调用，供脚本、测试或日后「文章归档页」复用。
 */
export function getAllPosts(cwd = process.cwd()) {
  const slugs = getAllSlugs(cwd);
  const items = [];
  for (const slug of slugs) {
    const { data } = getPostBySlug(slug, cwd);
    items.push({
      slug: data.slug ?? slug,
      title: typeof data.title === "string" ? data.title : slug,
      published_at:
        data.published_at === undefined ? null : data.published_at,
    });
  }
  items.sort((a, b) => {
    const da = a.published_at ?? "";
    const db = b.published_at ?? "";
    return db.localeCompare(da);
  });
  return items;
}
