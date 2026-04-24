# Physics Book Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js homepage where floating paper cards gather into a tactile 3D book with page-flip interactions.

**Architecture:** The app is a single client-led homepage composed from focused components: a top-level state machine, local content data, a floating card field, an assembly transition, and a React Three Fiber book scene. The implementation uses deterministic spring and easing motion rather than a full rigid-body engine, with reduced-motion and non-WebGL fallbacks.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS modules/global CSS, Three.js, React Three Fiber, Vitest, Testing Library.

---

## File Structure

- Create `package.json`: scripts and dependencies.
- Create `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `.gitignore`: project configuration.
- Create `app/layout.tsx`: metadata and root layout.
- Create `app/page.tsx`: renders the homepage.
- Create `app/globals.css`: page-level visual reset, theme tokens, responsive layout.
- Create `components/HomePage.tsx`: scene state machine and orchestration.
- Create `components/CardField.tsx`: floating paper cards, pointer parallax, primary start interaction.
- Create `components/BookAssembly.tsx`: short transition layer from card stack to book.
- Create `components/BookScene.tsx`: 3D book, page navigation, WebGL guard.
- Create `components/BookPage.tsx`: reusable 3D page surface.
- Create `components/StaticBookFallback.tsx`: accessible non-WebGL and reduced fallback layout.
- Create `lib/content.ts`: structured homepage content.
- Create `lib/motion.ts`: deterministic easing and reduced-motion helper.
- Create `test/homepage.test.tsx`: component behavior tests.
- Create `vitest.config.ts`, `test/setup.ts`: test configuration.

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Create project configuration**

Add `package.json`:

```json
{
  "name": "next-blog-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@react-three/fiber": "^9.1.2",
    "next": "^15.3.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.176.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^22.14.1",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@types/three": "^0.176.0",
    "typescript": "^5.8.3",
    "vitest": "^3.1.2",
    "jsdom": "^26.1.0"
  }
}
```

Add `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

Add `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Add `postcss.config.mjs`:

```js
const config = {};

export default config;
```

Add `.gitignore`:

```gitignore
node_modules
.next
out
dist
coverage
.env
.env.local
*.log
```

- [ ] **Step 2: Create minimal app shell**

Add `app/layout.tsx`:

```tsx
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
```

Add `app/page.tsx`:

```tsx
export default function Page() {
  return (
    <main className="homepage-shell">
      <h1>LJTian</h1>
    </main>
  );
}
```

Add `app/globals.css`:

```css
:root {
  color-scheme: light;
  --ink: #1d1b18;
  --muted: #706b63;
  --paper: #f8f4ec;
  --paper-deep: #e6dccd;
  --line: rgba(29, 27, 24, 0.12);
  --accent: #3d5a6c;
  --background: #f1eee8;
}

* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
}

body {
  background: var(--background);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button {
  font: inherit;
}

.homepage-shell {
  min-height: 100vh;
}
```

- [ ] **Step 3: Install dependencies**

Run: `pnpm install`

Expected: `node_modules` is installed and `pnpm-lock.yaml` is created.

- [ ] **Step 4: Verify scaffold builds**

Run: `pnpm build`

Expected: Next.js production build succeeds.

- [ ] **Step 5: Commit scaffold**

```bash
git add .gitignore package.json pnpm-lock.yaml next.config.mjs tsconfig.json postcss.config.mjs app
git commit -m "feat: scaffold physics homepage app"
```

## Task 2: Add Content and Motion Utilities

**Files:**
- Create: `lib/content.ts`
- Create: `lib/motion.ts`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `test/homepage.test.tsx`

- [ ] **Step 1: Add test configuration**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname
    }
  }
});
```

Create `test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write failing tests for content and motion**

Create `test/homepage.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { bookPages, homepageCards } from "@/lib/content";
import { easeOutCubic, prefersReducedMotion } from "@/lib/motion";

describe("homepage content", () => {
  it("provides cards and book pages for the main experience", () => {
    expect(homepageCards).toHaveLength(5);
    expect(bookPages.map((page) => page.kind)).toEqual(["cover", "featured", "topics", "about", "archive"]);
  });
});

describe("motion helpers", () => {
  it("eases values deterministically", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
  });

  it("returns false for reduced motion when matchMedia is unavailable", () => {
    expect(prefersReducedMotion()).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run: `pnpm test`

Expected: FAIL because `@/lib/content` and `@/lib/motion` do not exist.

- [ ] **Step 4: Implement content and motion modules**

Create `lib/content.ts`:

```ts
export type HomepageCard = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  tone: "warm" | "cool" | "deep" | "plain";
};

export type BookPage =
  | { kind: "cover"; title: string; subtitle: string }
  | { kind: "featured"; title: string; entries: Array<{ title: string; meta: string }> }
  | { kind: "topics"; title: string; topics: string[] }
  | { kind: "about"; title: string; body: string }
  | { kind: "archive"; title: string; body: string; action: string };

export const homepageCards: HomepageCard[] = [
  {
    id: "featured",
    eyebrow: "Featured",
    title: "Selected Notes",
    summary: "Carefully kept essays on systems, tools, and engineering judgment.",
    tone: "plain"
  },
  {
    id: "cloud",
    eyebrow: "Topic",
    title: "Cloud Native",
    summary: "Kubernetes, observability, and production architecture.",
    tone: "cool"
  },
  {
    id: "ai",
    eyebrow: "Topic",
    title: "AI Engineering",
    summary: "Practical experiments with agents, evaluation, and developer workflows.",
    tone: "deep"
  },
  {
    id: "about",
    eyebrow: "About",
    title: "LJTian",
    summary: "A personal index of work, learning, and durable notes.",
    tone: "warm"
  },
  {
    id: "archive",
    eyebrow: "Archive",
    title: "All Pages",
    summary: "A quiet path into older writing and reference material.",
    tone: "plain"
  }
];

export const bookPages: BookPage[] = [
  { kind: "cover", title: "LJTian", subtitle: "Next Blog" },
  {
    kind: "featured",
    title: "Featured",
    entries: [
      { title: "Designing Reliable Systems", meta: "Architecture" },
      { title: "Notes on AI Tooling", meta: "AI Engineering" },
      { title: "Cloud Native Field Guide", meta: "Infrastructure" }
    ]
  },
  { kind: "topics", title: "Topics", topics: ["Cloud Native", "AI", "Linux", "Docker", "Go", "English"] },
  {
    kind: "about",
    title: "About",
    body: "A personal blog for technical notes, engineering practice, and the parts of learning worth keeping."
  },
  {
    kind: "archive",
    title: "Archive",
    body: "Browse the full collection of writing, experiments, and references.",
    action: "Open archive"
  }
];
```

Create `lib/motion.ts`:

```ts
export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function easeOutCubic(value: number) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
```

- [ ] **Step 5: Verify tests pass**

Run: `pnpm test`

Expected: PASS for content and motion tests.

- [ ] **Step 6: Commit utilities**

```bash
git add lib vitest.config.ts test
git commit -m "feat: add homepage content and motion helpers"
```

## Task 3: Build Homepage State and Floating Cards

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Create: `components/HomePage.tsx`
- Create: `components/CardField.tsx`
- Modify: `test/homepage.test.tsx`

- [ ] **Step 1: Write failing component tests**

Append to `test/homepage.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "@/components/HomePage";

describe("HomePage", () => {
  it("renders the card field first", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "LJTian" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /assemble the book/i })).toBeInTheDocument();
  });

  it("starts the assembly state from the primary action", async () => {
    render(<HomePage />);
    await userEvent.click(screen.getByRole("button", { name: /assemble the book/i }));
    expect(screen.getByText("Binding pages")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Add user-event dependency**

Update `package.json` dev dependencies to include:

```json
"@testing-library/user-event": "^14.6.1"
```

Run: `pnpm install`

Expected: lockfile updates successfully.

- [ ] **Step 3: Run tests to verify failure**

Run: `pnpm test`

Expected: FAIL because `components/HomePage` does not exist.

- [ ] **Step 4: Implement page and card field**

Replace `app/page.tsx`:

```tsx
import HomePage from "@/components/HomePage";

export default function Page() {
  return <HomePage />;
}
```

Create `components/HomePage.tsx`:

```tsx
"use client";

import { useState } from "react";
import { homepageCards } from "@/lib/content";
import CardField from "@/components/CardField";

type SceneState = "cards" | "assembling" | "book";

export default function HomePage() {
  const [scene, setScene] = useState<SceneState>("cards");

  return (
    <main className="home">
      <section className="home__stage" aria-label="Interactive physics book homepage">
        <div className="home__intro">
          <p>Next Blog</p>
          <h1>LJTian</h1>
        </div>
        {scene === "cards" ? <CardField cards={homepageCards} onAssemble={() => setScene("assembling")} /> : null}
        {scene === "assembling" ? <div className="assembly-status">Binding pages</div> : null}
      </section>
    </main>
  );
}
```

Create `components/CardField.tsx`:

```tsx
"use client";

import type { HomepageCard } from "@/lib/content";

type CardFieldProps = {
  cards: HomepageCard[];
  onAssemble: () => void;
};

export default function CardField({ cards, onAssemble }: CardFieldProps) {
  return (
    <div className="card-field">
      <div className="card-field__cards" aria-label="Floating content cards">
        {cards.map((card, index) => (
          <article className={`paper-card paper-card--${card.tone}`} key={card.id} style={{ "--i": index } as React.CSSProperties}>
            <p>{card.eyebrow}</p>
            <h2>{card.title}</h2>
            <span>{card.summary}</span>
          </article>
        ))}
      </div>
      <button className="assemble-button" type="button" onClick={onAssemble}>
        Assemble the book
      </button>
    </div>
  );
}
```

Append to `app/globals.css`:

```css
.home {
  min-height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0)),
    var(--background);
}

.home__stage {
  position: relative;
  display: grid;
  min-height: 100vh;
  padding: clamp(24px, 5vw, 72px);
  place-items: center;
}

.home__intro {
  position: absolute;
  top: clamp(24px, 5vw, 64px);
  left: clamp(24px, 5vw, 72px);
  z-index: 2;
}

.home__intro p,
.paper-card p {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home__intro h1 {
  margin: 0;
  font-size: clamp(2.4rem, 8vw, 7rem);
  font-weight: 500;
  line-height: 0.9;
}

.card-field {
  position: relative;
  width: min(980px, 100%);
  height: min(660px, 72vh);
}

.card-field__cards {
  position: absolute;
  inset: 0;
}

.paper-card {
  position: absolute;
  width: clamp(180px, 22vw, 260px);
  min-height: 150px;
  padding: 22px;
  border: 1px solid var(--line);
  background: rgba(248, 244, 236, 0.86);
  box-shadow: 0 20px 50px rgba(50, 43, 35, 0.12);
  transform: translate3d(calc((var(--i) - 2) * 92px), calc(((var(--i) % 2) * 72px) - 40px), 0) rotate(calc((var(--i) - 2) * 3deg));
  transition: transform 500ms ease, box-shadow 500ms ease;
}

.paper-card:nth-child(1) { left: 12%; top: 24%; }
.paper-card:nth-child(2) { left: 42%; top: 12%; }
.paper-card:nth-child(3) { left: 62%; top: 42%; }
.paper-card:nth-child(4) { left: 18%; top: 54%; }
.paper-card:nth-child(5) { left: 48%; top: 58%; }

.paper-card h2 {
  margin: 0 0 14px;
  font-size: 1.2rem;
  font-weight: 520;
}

.paper-card span {
  color: var(--muted);
  line-height: 1.55;
}

.paper-card--cool { background: rgba(232, 239, 240, 0.9); }
.paper-card--deep { background: rgba(222, 226, 220, 0.9); }
.paper-card--warm { background: rgba(244, 232, 216, 0.9); }

.assemble-button {
  position: absolute;
  right: 4%;
  bottom: 5%;
  border: 1px solid rgba(29, 27, 24, 0.2);
  background: var(--ink);
  color: var(--paper);
  padding: 12px 18px;
  cursor: pointer;
}

.assembly-status {
  color: var(--muted);
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 760px) {
  .card-field {
    height: 68vh;
  }

  .paper-card {
    width: min(78vw, 280px);
    min-height: 128px;
  }
}
```

- [ ] **Step 5: Verify tests pass**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 6: Commit card field**

```bash
git add app components test package.json pnpm-lock.yaml
git commit -m "feat: add floating card homepage"
```

## Task 4: Add Assembly Transition and Book Mode

**Files:**
- Modify: `components/HomePage.tsx`
- Create: `components/BookAssembly.tsx`
- Modify: `app/globals.css`
- Modify: `test/homepage.test.tsx`

- [ ] **Step 1: Write failing assembly completion test**

Append to `test/homepage.test.tsx`:

```tsx
import { act } from "react";
import { vi } from "vitest";

describe("book assembly", () => {
  it("moves from assembly into book mode", async () => {
    vi.useFakeTimers();
    render(<HomePage />);
    await userEvent.click(screen.getByRole("button", { name: /assemble the book/i }));
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(screen.getByText("The book is ready")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test`

Expected: FAIL because book mode is not implemented.

- [ ] **Step 3: Implement assembly component**

Create `components/BookAssembly.tsx`:

```tsx
"use client";

import { useEffect } from "react";

type BookAssemblyProps = {
  onComplete: () => void;
};

export default function BookAssembly({ onComplete }: BookAssemblyProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1200);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="book-assembly" aria-live="polite">
      <div className="book-assembly__stack" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <p>Binding pages</p>
    </div>
  );
}
```

Replace `components/HomePage.tsx`:

```tsx
"use client";

import { useCallback, useState } from "react";
import BookAssembly from "@/components/BookAssembly";
import CardField from "@/components/CardField";
import { homepageCards } from "@/lib/content";

type SceneState = "cards" | "assembling" | "book";

export default function HomePage() {
  const [scene, setScene] = useState<SceneState>("cards");
  const showBook = useCallback(() => setScene("book"), []);

  return (
    <main className="home">
      <section className="home__stage" aria-label="Interactive physics book homepage">
        <div className="home__intro">
          <p>Next Blog</p>
          <h1>LJTian</h1>
        </div>
        {scene === "cards" ? <CardField cards={homepageCards} onAssemble={() => setScene("assembling")} /> : null}
        {scene === "assembling" ? <BookAssembly onComplete={showBook} /> : null}
        {scene === "book" ? <div className="book-ready">The book is ready</div> : null}
      </section>
    </main>
  );
}
```

Append to `app/globals.css`:

```css
.book-assembly {
  display: grid;
  gap: 24px;
  place-items: center;
}

.book-assembly__stack {
  position: relative;
  width: min(380px, 70vw);
  height: 260px;
}

.book-assembly__stack span {
  position: absolute;
  inset: 20px;
  border: 1px solid var(--line);
  background: var(--paper);
  box-shadow: 0 22px 60px rgba(50, 43, 35, 0.14);
  animation: bind-page 1200ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.book-assembly__stack span:nth-child(1) { transform: translate(-130px, -42px) rotate(-8deg); }
.book-assembly__stack span:nth-child(2) { transform: translate(80px, -56px) rotate(7deg); }
.book-assembly__stack span:nth-child(3) { transform: translate(-70px, 78px) rotate(5deg); }
.book-assembly__stack span:nth-child(4) { transform: translate(112px, 56px) rotate(-6deg); }

.book-assembly p,
.book-ready {
  color: var(--muted);
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@keyframes bind-page {
  to {
    transform: translate(0, 0) rotate(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .book-assembly__stack span {
    animation-duration: 1ms;
  }
}
```

- [ ] **Step 4: Verify tests pass**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 5: Commit assembly transition**

```bash
git add components app test
git commit -m "feat: add book assembly transition"
```

## Task 5: Implement 3D Book Scene and Fallback

**Files:**
- Modify: `components/HomePage.tsx`
- Create: `components/BookScene.tsx`
- Create: `components/BookPage.tsx`
- Create: `components/StaticBookFallback.tsx`
- Modify: `app/globals.css`
- Modify: `test/homepage.test.tsx`

- [ ] **Step 1: Write failing book interaction tests**

Replace the assertion in the existing assembly completion test with:

```tsx
expect(screen.getByRole("button", { name: /next page/i })).toBeInTheDocument();
```

Append:

```tsx
describe("BookScene", () => {
  it("supports page navigation in fallback controls", async () => {
    render(<HomePage initialScene="book" />);
    expect(screen.getByText("LJTian")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test`

Expected: FAIL because `initialScene` and book controls are not implemented.

- [ ] **Step 3: Implement reusable page surface**

Create `components/BookPage.tsx`:

```tsx
"use client";

import { Html } from "@react-three/drei";
import type { BookPage as BookPageData } from "@/lib/content";

type BookPageProps = {
  page: BookPageData;
  rotation: number;
  offset: number;
};

export default function BookPage({ page, rotation, offset }: BookPageProps) {
  return (
    <group rotation-y={rotation} position={[offset, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 3.2, 0.035]} />
        <meshStandardMaterial color={page.kind === "cover" ? "#2b2925" : "#f8f4ec"} roughness={0.82} />
      </mesh>
      <Html transform position={[0, 0, 0.03]} style={{ width: 210, pointerEvents: "none" }}>
        <div className={page.kind === "cover" ? "book-html book-html--cover" : "book-html"}>
          <strong>{page.title}</strong>
        </div>
      </Html>
    </group>
  );
}
```

Install missing drei dependency by adding to `package.json` dependencies:

```json
"@react-three/drei": "^10.0.7"
```

Run: `pnpm install`

- [ ] **Step 4: Implement static fallback**

Create `components/StaticBookFallback.tsx`:

```tsx
"use client";

import type { BookPage } from "@/lib/content";

type StaticBookFallbackProps = {
  pages: BookPage[];
  index: number;
  visible?: boolean;
};

export default function StaticBookFallback({ pages, index, visible = false }: StaticBookFallbackProps) {
  const page = pages[index];

  return (
    <article className={visible ? "static-book static-book--visible" : "static-book"} aria-live="polite">
      <div className={`static-book__page static-book__page--${page.kind}`}>
        <p>{page.kind}</p>
        <h2>{page.title}</h2>
        {"subtitle" in page ? <span>{page.subtitle}</span> : null}
        {"entries" in page ? page.entries.map((entry) => <span key={entry.title}>{entry.title} / {entry.meta}</span>) : null}
        {"topics" in page ? <span>{page.topics.join(" / ")}</span> : null}
        {"body" in page ? <span>{page.body}</span> : null}
        {"action" in page ? <button type="button">{page.action}</button> : null}
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Implement book scene and navigation**

Create `components/BookScene.tsx`:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import BookPage from "@/components/BookPage";
import StaticBookFallback from "@/components/StaticBookFallback";
import { bookPages } from "@/lib/content";

export default function BookScene() {
  const [pageIndex, setPageIndex] = useState(0);
  const [canUseWebGL, setCanUseWebGL] = useState(true);
  const canGoBack = pageIndex > 0;
  const canGoNext = pageIndex < bookPages.length - 1;
  const rotations = useMemo(() => bookPages.map((_, index) => (index <= pageIndex ? -Math.PI * 0.82 : 0)), [pageIndex]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    setCanUseWebGL(Boolean(context));
  }, []);

  return (
    <div className="book-scene">
      {canUseWebGL ? (
        <div className="book-scene__canvas" aria-hidden="true">
          <Canvas shadows camera={{ position: [0, 1.2, 6], fov: 42 }}>
            <ambientLight intensity={1.8} />
            <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow />
            <group rotation-x={-0.2} rotation-z={-0.02}>
              {bookPages.map((page, index) => (
                <BookPage key={page.kind} page={page} rotation={rotations[index]} offset={index * 0.018} />
              ))}
            </group>
          </Canvas>
        </div>
      ) : null}
      <StaticBookFallback pages={bookPages} index={pageIndex} visible={!canUseWebGL} />
      <nav className="book-controls" aria-label="Book pages">
        <button type="button" onClick={() => setPageIndex((value) => Math.max(0, value - 1))} disabled={!canGoBack}>
          Previous page
        </button>
        <span>{pageIndex + 1} / {bookPages.length}</span>
        <button type="button" onClick={() => setPageIndex((value) => Math.min(bookPages.length - 1, value + 1))} disabled={!canGoNext}>
          Next page
        </button>
      </nav>
    </div>
  );
}
```

Modify `components/HomePage.tsx` props and book rendering:

```tsx
"use client";

import { useCallback, useState } from "react";
import BookAssembly from "@/components/BookAssembly";
import BookScene from "@/components/BookScene";
import CardField from "@/components/CardField";
import { homepageCards } from "@/lib/content";

type SceneState = "cards" | "assembling" | "book";

type HomePageProps = {
  initialScene?: SceneState;
};

export default function HomePage({ initialScene = "cards" }: HomePageProps) {
  const [scene, setScene] = useState<SceneState>(initialScene);
  const showBook = useCallback(() => setScene("book"), []);

  return (
    <main className="home">
      <section className="home__stage" aria-label="Interactive physics book homepage">
        <div className="home__intro">
          <p>Next Blog</p>
          <h1>LJTian</h1>
        </div>
        {scene === "cards" ? <CardField cards={homepageCards} onAssemble={() => setScene("assembling")} /> : null}
        {scene === "assembling" ? <BookAssembly onComplete={showBook} /> : null}
        {scene === "book" ? <BookScene /> : null}
      </section>
    </main>
  );
}
```

Append to `app/globals.css`:

```css
.book-scene {
  display: grid;
  width: min(980px, 100%);
  gap: 18px;
  place-items: center;
}

.book-scene__canvas {
  width: min(760px, 92vw);
  height: min(520px, 58vh);
}

.static-book {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.static-book--visible {
  position: static;
  width: min(520px, 92vw);
  height: auto;
  overflow: visible;
}

.static-book__page {
  display: grid;
  gap: 10px;
}

.book-controls {
  display: flex;
  align-items: center;
  gap: 14px;
}

.book-controls button,
.static-book button {
  border: 1px solid rgba(29, 27, 24, 0.2);
  background: rgba(248, 244, 236, 0.88);
  color: var(--ink);
  padding: 10px 14px;
  cursor: pointer;
}

.book-controls button:disabled {
  cursor: default;
  opacity: 0.38;
}

.book-html {
  display: grid;
  min-height: 280px;
  place-items: center;
  color: #1d1b18;
  font-family: Georgia, serif;
  font-size: 22px;
  text-align: center;
}

.book-html--cover {
  color: #f8f4ec;
}

@media (max-width: 760px) {
  .book-scene__canvas {
    height: 46vh;
  }
}
```

- [ ] **Step 6: Verify tests pass**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 7: Commit book scene**

```bash
git add components app test package.json pnpm-lock.yaml
git commit -m "feat: add interactive book scene"
```

## Task 6: Polish Responsiveness, Reduced Motion, and Build

**Files:**
- Modify: `components/CardField.tsx`
- Modify: `components/BookAssembly.tsx`
- Modify: `components/BookScene.tsx`
- Modify: `app/globals.css`
- Modify: `test/homepage.test.tsx`

- [ ] **Step 1: Add reduced-motion behavior tests**

Append to `test/homepage.test.tsx`:

```tsx
describe("accessibility affordances", () => {
  it("keeps the primary experience accessible by role and label", () => {
    render(<HomePage />);
    expect(screen.getByLabelText("Interactive physics book homepage")).toBeInTheDocument();
    expect(screen.getByLabelText("Floating content cards")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 3: Polish motion and responsive styles**

Update `components/CardField.tsx` to add pointer position variables:

```tsx
"use client";

import { useState } from "react";
import type { HomepageCard } from "@/lib/content";

type CardFieldProps = {
  cards: HomepageCard[];
  onAssemble: () => void;
};

export default function CardField({ cards, onAssemble }: CardFieldProps) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  return (
    <div
      className="card-field"
      style={{ "--px": pointer.x, "--py": pointer.y } as React.CSSProperties}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: (event.clientX - rect.left) / rect.width - 0.5,
          y: (event.clientY - rect.top) / rect.height - 0.5
        });
      }}
    >
      <div className="card-field__cards" aria-label="Floating content cards">
        {cards.map((card, index) => (
          <article className={`paper-card paper-card--${card.tone}`} key={card.id} style={{ "--i": index } as React.CSSProperties}>
            <p>{card.eyebrow}</p>
            <h2>{card.title}</h2>
            <span>{card.summary}</span>
          </article>
        ))}
      </div>
      <button className="assemble-button" type="button" onClick={onAssemble}>
        Assemble the book
      </button>
    </div>
  );
}
```

Revise `.paper-card` transform in `app/globals.css`:

```css
.paper-card {
  position: absolute;
  width: clamp(180px, 22vw, 260px);
  min-height: 150px;
  padding: 22px;
  border: 1px solid var(--line);
  background: rgba(248, 244, 236, 0.86);
  box-shadow: 0 20px 50px rgba(50, 43, 35, 0.12);
  transform:
    translate3d(
      calc((var(--i) - 2) * 92px + var(--px, 0) * 18px),
      calc(((var(--i) % 2) * 72px) - 40px + var(--py, 0) * 18px),
      0
    )
    rotate(calc((var(--i) - 2) * 3deg));
  transition: transform 500ms ease, box-shadow 500ms ease;
}
```

Append:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```

- [ ] **Step 4: Run full verification**

Run: `pnpm test`

Expected: PASS.

Run: `pnpm build`

Expected: Next.js production build succeeds.

- [ ] **Step 5: Commit polish**

```bash
git add components app test
git commit -m "feat: polish physics book homepage"
```

## Task 7: Start Local Dev Server

**Files:**
- No file changes.

- [ ] **Step 1: Start the app**

Run: `pnpm dev`

Expected: app starts on `http://localhost:3000`.

- [ ] **Step 2: Open and inspect**

Open `http://localhost:3000`.

Expected: floating cards appear first; clicking `Assemble the book` transitions to the book; page buttons work.

## Self-Review

Spec coverage:

- Scattered cards are covered by Task 3.
- Card-to-book transition is covered by Task 4.
- 3D book and page flipping are covered by Task 5.
- Minimal premium visual direction is covered by Tasks 3, 5, and 6.
- Local structured content is covered by Task 2.
- Reduced-motion behavior is covered by Task 6.
- WebGL/static accessibility fallback is covered by Task 5.
- Build and test verification are covered by Tasks 1, 2, 3, 4, 5, and 6.

Red flag scan: no banned planning markers remain.

Type consistency: `HomepageCard`, `BookPage`, `SceneState`, `initialScene`, and component props are named consistently across tasks.
