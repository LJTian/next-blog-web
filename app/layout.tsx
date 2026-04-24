import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LJTian | Next Blog",
  description: "A tactile physics-inspired blog homepage."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
