import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Source_Serif_4 } from "next/font/google";

import { SiteTopbar } from "@/components/SiteTopbar";
import "./globals.css";
import "react-notion-x/styles.css";
/* Notion Code 使用 Prism；浅色主题与站点 Notion 风一致（勿用 tomorrow 配浅色底） */
import "prismjs/themes/prism.css";
import "katex/dist/katex.min.css";

const fontSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LJTian Blog",
    template: "%s · LJTian Blog",
  },
  description: "写作于 Notion，构建为静态站点。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
        suppressHydrationWarning
      >
        {children}
        <SiteTopbar />
      </body>
    </html>
  );
}
