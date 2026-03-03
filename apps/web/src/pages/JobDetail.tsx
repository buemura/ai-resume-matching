import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getJob, getJobMatches, computeMatches } from "../api/client";
import type { Job, Match } from "../types";
import MatchCard from "../components/MatchCard";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [biasReduced, setBiasReduced] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getJob(id), getJobMatches(id)])
      .then(([j, m]) => {
        setJob(j);
        setMatches(m);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCompute() {
    if (!id) return;
    setComputing(true);
    try {
      const results = await computeMatches({
        job_id: id,
        bias_reduced: biasReduced,
      });
      setMatches(results);
    } finally {
      setComputing(false);
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading job...</p>;
  }

  if (!job) {
    return <p className="text-red-600">Job not found.</p>;
  }

  return (
    <div>
      <Link to="/jobs" className="text-sm text-indigo-600 hover:underline">
        &larr; Back to Jobs
      </Link>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
        <p className="mt-1 text-gray-600">{job.company}</p>
        <p className="mt-1 text-sm text-gray-400">
          Created {new Date(job.created_at).toLocaleDateString()}
        </p>

        {job.skills && job.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
          {job.description}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Matching Candidates
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
                <MatchCard key={m.id} match={m} mode="job" />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
