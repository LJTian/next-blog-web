const notionBlogUrl =
  "https://tianlj.notion.site/LJTian-Blog-ce8a73f53641460cb4ba5f92596ae14b";

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="LJTian Blog home">
          LJTian Blog
        </a>
        <a
          className="notion-link"
          href={notionBlogUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Notion
        </a>
      </header>
      <section className="embed-frame" aria-label="LJTian Notion blog">
        <iframe
          title="LJTian Blog on Notion"
          src={notionBlogUrl}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>
    </main>
  );
}
