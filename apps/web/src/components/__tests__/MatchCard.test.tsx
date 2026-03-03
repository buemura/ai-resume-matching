import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import MatchCard from "../MatchCard";
import type { Match } from "../../types";

const baseMatch: Match = {
  id: "match-1",
  job_id: "job-1",
  resume_id: "resume-1",
  similarity_score: 0.85,
  bias_reduced: false,
  created_at: "2024-01-01T00:00:00Z",
  job_title: "Software Engineer",
  job_company: "Acme Corp",
  candidate_name: "John Doe",
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("MatchCard", () => {
  it("shows candidate name in job mode", () => {
    renderWithRouter(<MatchCard match={baseMatch} mode="job" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("shows job title in resume mode", () => {
    renderWithRouter(<MatchCard match={baseMatch} mode="resume" />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("links to resume detail in job mode", () => {
    renderWithRouter(<MatchCard match={baseMatch} mode="job" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/resumes/resume-1");
  });

  it("links to job detail in resume mode", () => {
    renderWithRouter(<MatchCard match={baseMatch} mode="resume" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/jobs/job-1");
  });

  it("displays the score badge", () => {
    renderWithRouter(<MatchCard match={baseMatch} mode="job" />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("shows fallback for missing candidate name", () => {
    const match = { ...baseMatch, candidate_name: undefined };
    renderWithRouter(<MatchCard match={match} mode="job" />);
    expect(screen.getByText("Unknown Candidate")).toBeInTheDocument();
  });

  it("shows fallback for missing job title", () => {
    const match = { ...baseMatch, job_title: undefined };
    renderWithRouter(<MatchCard match={match} mode="resume" />);
    expect(screen.getByText("Unknown Job")).toBeInTheDocument();
  });
});
