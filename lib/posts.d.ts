export type PostFrontmatter = {
  title: string;
  slug: string;
  page_id?: string;
  published_at: string | null;
};

export type PostListItem = {
  slug: string;
  title: string;
  published_at: string | null;
};

export function getAllSlugs(cwd?: string): string[];

export function getPostBySlug(
  slug: string,
  cwd?: string,
): {
  data: PostFrontmatter;
  content: string;
};

export function getAllPosts(cwd?: string): PostListItem[];
