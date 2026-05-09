"use client";

import { useMemo, useState } from "react";

export type BlogProfileHeroProps = {
  /** Notion 页面封面 URL（已由 defaultMapImageUrl 处理） */
  coverUrl?: string | null;
  iconUrl?: string | null;
  iconEmoji?: string | null;
  title?: string;
};

function initialsFromTitle(name: string): string {
  const t = name.trim();
  if (!t) return "—";
  const segs = t.split(/\s+/).filter(Boolean);
  if (segs.length >= 2) {
    const a = segs[0]?.[0] ?? "";
    const b = segs[1]?.[0] ?? "";
    return (a + b).toUpperCase().slice(0, 2);
  }
  return t.slice(0, 2).toUpperCase();
}

/**
 * 渐变横幅 + 压在底边上的头像 + 标题。
 * 传入 `coverUrl` / `iconUrl` / `iconEmoji` 时使用 Notion 页面资源；否则为本地占位样式。
 */
export function BlogProfileHero({
  coverUrl = null,
  iconUrl = null,
  iconEmoji = null,
  title = "LJTian Blog",
}: BlogProfileHeroProps) {
  const [coverBroken, setCoverBroken] = useState(false);
  const [iconBroken, setIconBroken] = useState(false);

  const initials = useMemo(() => initialsFromTitle(title), [title]);

  const showCover = Boolean(coverUrl && !coverBroken);
  const showIconImg = Boolean(iconUrl && !iconBroken);

  return (
    <section className="blog-profile-hero" aria-label="站点">
      <div
        className={`blog-profile-banner${showCover ? " blog-profile-banner--cover" : ""}`}
        aria-hidden={showCover}
      >
        {showCover ? (
          // eslint-disable-next-line @next/next/no-img-element -- Notion 外链需 onError 回退
          <img
            src={coverUrl!}
            alt=""
            className="blog-profile-banner-img"
            decoding="async"
            onError={() => setCoverBroken(true)}
          />
        ) : null}
      </div>
      <div className="blog-profile-avatar-wrap">
        {showIconImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconUrl!}
            alt=""
            width={96}
            height={96}
            decoding="async"
            className="blog-profile-avatar blog-profile-avatar-img"
            onError={() => setIconBroken(true)}
          />
        ) : iconEmoji ? (
          <span
            className="blog-profile-avatar blog-profile-avatar-emoji"
            role="img"
            aria-label={title}
          >
            {iconEmoji}
          </span>
        ) : (
          <span
            className="blog-profile-avatar blog-profile-avatar-fallback"
            aria-hidden
          >
            {initials}
          </span>
        )}
      </div>
      <p className="blog-profile-site-title">{title}</p>
    </section>
  );
}
