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
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onAssemble();
        }
      }}
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
