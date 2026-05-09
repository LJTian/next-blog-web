import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { normalizeNotionMarkdown } from "./notionMarkdownNormalize.js";
import { blogSanitizeSchema } from "./rehypeBlogSanitize";

export async function markdownToHtml(markdown: string): Promise<string> {
  const md = normalizeNotionMarkdown(markdown);
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "此标题的链接",
      },
    })
    .use(rehypePrettyCode, {
      theme: "one-light",
      keepBackground: true,
    })
    .use(rehypeExternalLinks, {
      target: "_blank",
      rel: ["nofollow", "noopener", "noreferrer"],
    })
    .use(rehypeSanitize, blogSanitizeSchema)
    .use(rehypeStringify)
    .process(md);
  return String(file);
}
