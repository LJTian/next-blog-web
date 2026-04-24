import React, { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/components/HomePage";
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

describe("HomePage", () => {
  it("renders the card field first", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: "LJTian" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /assemble the book/i })).toBeInTheDocument();
  });

  it("starts the assembly state from the primary action", async () => {
    render(<HomePage />);
    await userEvent.click(screen.getByRole("button", { name: /assemble the book/i }));
    expect(screen.getByText("Binding pages")).toBeInTheDocument();
  });

  it("moves from assembly into book mode", async () => {
    vi.useFakeTimers();
    render(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: /assemble the book/i }));
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(screen.getByRole("button", { name: /next page/i })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("supports page navigation in fallback controls", async () => {
    render(<HomePage initialScene="book" />);
    expect(screen.getAllByText("LJTian").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByLabelText("Turn to next page"));
    expect(screen.getAllByText("Featured").length).toBeGreaterThan(0);
  });

  it("keeps the primary experience accessible by role and label", () => {
    render(<HomePage />);
    expect(screen.getByLabelText("Interactive physics book homepage")).toBeInTheDocument();
    expect(screen.getByLabelText("Floating content cards")).toBeInTheDocument();
  });

  it("presents the upgraded tactile book affordances", () => {
    const { container } = render(<HomePage initialScene="book" />);
    expect(screen.getByLabelText("Turn to next page")).toBeInTheDocument();
    expect(screen.getByLabelText("Turn to previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Realistic open book")).toBeInTheDocument();
    expect(container.querySelector(".real-book--large")).not.toBeNull();
    expect(container.querySelector(".real-finger")).toBeNull();
    expect(container.querySelector(".turn-hand")).toBeNull();
    expect(container.querySelector(".static-book--visible")).toBeNull();
    expect(container.querySelector(".book-caption")).toBeNull();
    expect(container.querySelector(".home__intro")).toBeNull();
    expect(container.querySelector(".book-scene__copy")).toBeNull();
    expect(container.querySelector(".book-controls")).toBeNull();
  });
});
