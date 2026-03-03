import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getResume,
  getResumeMatches,
  computeMatches,
} from "../api/client";
import type { Resume, Match } from "../types";
import MatchCard from "../components/MatchCard";

export default function ResumeDetail() {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [biasReduced, setBiasReduced] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getResume(id), getResumeMatches(id)])
      .then(([r, m]) => {
        setResume(r);
        setMatches(m);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCompute() {
    if (!id) return;
    setComputing(true);
    try {
      const results = await computeMatches({
        resume_id: id,
        bias_reduced: biasReduced,
      });
      setMatches(results);
    } finally {
      setComputing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-base-300 animate-fade-in">
        <div className="h-4 w-4 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
        Loading resume...
      </div>
    );
  }

  if (!resume) {
    return (
      <p className="text-rose-accent animate-fade-in">Resume not found.</p>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/resumes"
        className="inline-flex items-center gap-1.5 text-sm text-base-300 hover:text-neon transition-colors duration-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Resumes
      </Link>

      <div className="mt-6 glass-card p-8">
        <h1 className="font-display text-3xl font-bold text-base-50 tracking-tight">
          {resume.candidate_name}
        </h1>
        <p className="mt-2 text-sm text-base-400 font-mono">
          {new Date(resume.created_at).toLocaleDateString()}
          {resume.file_name && (
            <span className="ml-3 text-base-300">
              uploaded from {resume.file_name}
            </span>
          )}
        </p>

        {resume.skills && resume.skills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-emerald-accent/10 border border-emerald-accent/20 px-3 py-1 text-xs font-medium text-emerald-accent"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 whitespace-pre-wrap text-sm text-base-200 leading-relaxed">
          {resume.content}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-base-50">
            Matching Jobs
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-base-300 cursor-pointer group">
              <input
                type="checkbox"
                checked={biasReduced}
                onChange={(e) => setBiasReduced(e.target.checked)}
                className="h-4 w-4 rounded border-base-500 bg-base-700 text-neon focus:ring-neon/30 focus:ring-offset-0"
              />
              <span className="group-hover:text-base-200 transition-colors">
                Bias-reduced
              </span>
            </label>
            <button
              onClick={handleCompute}
              disabled={computing}
              className="rounded-lg bg-neon px-5 py-2.5 text-sm font-semibold text-base-950 hover:bg-neon-dim transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              {computing ? (
                <span className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-base-950/30 border-t-base-950 animate-spin" />
                  Computing...
                </span>
              ) : (
                "Find Matches"
              )}
            </button>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
            <p className="text-base-300">No matches yet.</p>
            <p className="mt-1 text-sm text-base-400">
              Click &ldquo;Find Matches&rdquo; to compute.
            </p>
          </div>
        ) : matches.filter((m) => m.similarity_score >= 0.5).length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
            <p className="text-base-300">No matches above 50% found.</p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {matches
              .filter((m) => m.similarity_score >= 0.5)
              .map((m) => (
                <MatchCard key={m.id} match={m} mode="resume" />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
