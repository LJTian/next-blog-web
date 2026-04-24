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
        <span />
      </div>
      <p>Binding pages</p>
    </div>
  );
}
