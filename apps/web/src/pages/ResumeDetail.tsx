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
    return <p className="text-gray-500">Loading resume...</p>;
  }

  if (!resume) {
    return <p className="text-red-600">Resume not found.</p>;
  }

  return (
    <div>
      <Link
        to="/resumes"
        className="text-sm text-indigo-600 hover:underline"
      >
        &larr; Back to Resumes
      </Link>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          {resume.candidate_name}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Created {new Date(resume.created_at).toLocaleDateString()}
          {resume.file_name && (
            <span className="ml-2 text-gray-500">
              (uploaded from {resume.file_name})
            </span>
          )}
        </p>

        {resume.skills && resume.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
          {resume.content}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Matching Jobs
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={biasReduced}
                onChange={(e) => setBiasReduced(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Bias-reduced
            </label>
            <button
              onClick={handleCompute}
              disabled={computing}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {computing ? "Computing..." : "Find Matches"}
            </button>
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="text-sm text-gray-500">
            No matches yet. Click "Find Matches" to compute.
          </p>
        ) : matches.filter((m) => m.similarity_score >= 0.5).length === 0 ? (
          <p className="text-sm text-gray-500">
            No matches above 50% found.
          </p>
        ) : (
          <div className="space-y-3">
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
