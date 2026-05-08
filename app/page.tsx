import { getNotionEmbedConfig, notionBlogUrl } from "../lib/notionConfig";

export default function Home() {
  const notionConfig = getNotionEmbedConfig();

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
          在 Notion 打开
        </a>
      </header>
      <section className="embed-frame" aria-label="LJTian Notion blog">
        <iframe
          title="LJTian Blog on Notion"
          src={notionConfig.embedUrl}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>
    </main>
  );
}
