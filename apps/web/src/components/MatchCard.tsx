import { Link } from "react-router-dom";
import type { Match } from "../types";
import ScoreBadge from "./ScoreBadge";

interface MatchCardProps {
  match: Match;
  mode: "job" | "resume";
}

export default function MatchCard({ match, mode }: MatchCardProps) {
  const title =
    mode === "job"
      ? (match.candidate_name ?? "Unknown Candidate")
      : (match.job_title ?? "Unknown Job");

  const subtitle =
    mode === "job" ? "Candidate" : (match.job_company ?? "Unknown Company");

  const link =
    mode === "job"
      ? `/resumes/${match.resume_id}`
      : `/jobs/${match.job_id}`;

  return (
    <Link
      to={link}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <ScoreBadge score={match.similarity_score} />
      </div>
      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-indigo-500"
            style={{ width: `${Math.round(match.similarity_score * 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
