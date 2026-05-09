export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="blog-layout-root tb-site" suppressHydrationWarning>
      {children}
    </div>
  );
}
