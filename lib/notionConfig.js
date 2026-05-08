export const notionBlogUrl =
  "https://tianlj.notion.site/LJTian-Blog-ce8a73f53641460cb4ba5f92596ae14b";
export const notionEmbedUrl =
  "https://tianlj.notion.site/ebd//ce8a73f53641460cb4ba5f92596ae14b";

export function getNotionEmbedConfig(env = process.env) {
  const configuredUrl = env.NEXT_PUBLIC_NOTION_EMBED_URL?.trim();
  const embedUrl = configuredUrl || notionEmbedUrl;

  return {
    mode: "embed",
    pageUrl: notionBlogUrl,
    embedUrl,
  };
}
