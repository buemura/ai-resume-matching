import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ScoreBadge from "../ScoreBadge";

describe("ScoreBadge", () => {
  it("displays percentage from decimal score", () => {
    render(<ScoreBadge score={0.85} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("rounds to nearest integer", () => {
    render(<ScoreBadge score={0.7749} />);
    expect(screen.getByText("77%")).toBeInTheDocument();
  });

  it("applies green color for high scores (>=80%)", () => {
    const { container } = render(<ScoreBadge score={0.9} />);
    expect(container.firstChild).toHaveClass("bg-emerald-accent/15");
  });

  it("applies yellow color for medium scores (60-79%)", () => {
    const { container } = render(<ScoreBadge score={0.65} />);
    expect(container.firstChild).toHaveClass("bg-amber-accent/15");
  });

  it("applies orange color for low-medium scores (40-59%)", () => {
    const { container } = render(<ScoreBadge score={0.45} />);
    expect(container.firstChild).toHaveClass("bg-orange-400/15");
  });

  it("applies red color for low scores (<40%)", () => {
    const { container } = render(<ScoreBadge score={0.2} />);
    expect(container.firstChild).toHaveClass("bg-rose-accent/15");
  });
});
