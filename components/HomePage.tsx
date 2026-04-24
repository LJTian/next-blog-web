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
    <main className={scene === "book" ? "home home--book" : "home"}>
      <section className="home__stage" aria-label="Interactive physics book homepage">
        {scene !== "book" ? (
          <div className="home__intro">
            <p>Next Blog</p>
            <h1>LJTian</h1>
          </div>
        ) : null}
        {scene === "cards" ? <CardField cards={homepageCards} onAssemble={() => setScene("assembling")} /> : null}
        {scene === "assembling" ? <BookAssembly onComplete={showBook} /> : null}
        {scene === "book" ? <BookScene /> : null}
      </section>
    </main>
  );
}
