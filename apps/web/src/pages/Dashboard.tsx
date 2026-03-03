import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs, getResumes, getMatches } from "../api/client";
import type { Match } from "../types";
import ScoreBadge from "../components/ScoreBadge";

export default function Dashboard() {
  const [jobCount, setJobCount] = useState(0);
  const [resumeCount, setResumeCount] = useState(0);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [allJobs, allResumes, matches] = await Promise.all([
          getJobs(0, 100),
          getResumes(0, 100),
          getMatches(0, 5),
        ]);
        setJobCount(allJobs.length);
        setResumeCount(allResumes.length);
        setRecentMatches(matches);
      } catch {
        // silently fail for dashboard
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  const stats = [
    { label: "Total Jobs", value: jobCount, link: "/jobs" },
    { label: "Total Resumes", value: resumeCount, link: "/resumes" },
    { label: "Recent Matches", value: recentMatches.length, link: "#" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Matches</h2>
        <div className="flex gap-2">
          <Link
            to="/jobs/new"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Job
          </Link>
          <Link
            to="/resumes/new"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Resume
          </Link>
        </div>
      </div>

      {recentMatches.filter((m) => m.similarity_score >= 0.5).length === 0 ? (
        <p className="text-sm text-gray-500">
          No matches yet. Add jobs and resumes, then compute matches.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentMatches
                .filter((m) => m.similarity_score >= 0.5)
                .map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        to={`/jobs/${m.job_id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {m.job_title ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        to={`/resumes/${m.resume_id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {m.candidate_name ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <ScoreBadge score={m.similarity_score} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
