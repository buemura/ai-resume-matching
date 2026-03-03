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

  const pct = Math.round(match.similarity_score * 100);

  let barColor: string;
  if (pct >= 80) barColor = "bg-emerald-accent";
  else if (pct >= 60) barColor = "bg-amber-accent";
  else if (pct >= 40) barColor = "bg-orange-400";
  else barColor = "bg-rose-accent";

  return (
    <Link
      to={link}
      className="glass-card block p-5 group hover:border-neon/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-semibold text-base-50 group-hover:text-neon transition-colors duration-200">
            {title}
          </p>
          <p className="text-sm text-base-300 mt-0.5">{subtitle}</p>
        </div>
        <ScoreBadge score={match.similarity_score} />
      </div>
      <div className="mt-4">
        <div className="h-1.5 w-full rounded-full bg-base-700 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-700`}
            style={{
              width: `${pct}%`,
              animation: "progress-fill 1s ease-out",
            }}
          />
        </div>
      </div>
    </Link>
  );
}
