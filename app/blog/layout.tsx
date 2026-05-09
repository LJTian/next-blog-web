import { BlogHomeFab } from "@/components/BlogHomeFab";
import { getBlogFabNavCategories } from "@/lib/siteCategories";

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fabCategories = getBlogFabNavCategories();

  return (
    <div className="blog-layout-root tb-site" suppressHydrationWarning>
      {children}
      <BlogHomeFab categories={fabCategories} />
    </div>
  );
}
