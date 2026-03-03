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
    return (
      <div className="flex items-center gap-3 text-base-300 animate-fade-in">
        <div className="h-4 w-4 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  const stats = [
    {
      label: "Total Jobs",
      value: jobCount,
      link: "/jobs",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      ),
      color: "text-neon",
      bgColor: "bg-neon/10",
    },
    {
      label: "Total Resumes",
      value: resumeCount,
      link: "/resumes",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: "text-violet-accent",
      bgColor: "bg-violet-accent/10",
    },
    {
      label: "Recent Matches",
      value: recentMatches.length,
      link: "#",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      color: "text-amber-accent",
      bgColor: "bg-amber-accent/10",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-base-50 tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-base-300 text-lg">
          AI-powered resume matching at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3 stagger-children">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="glass-card group relative overflow-hidden p-6 hover:border-neon/20"
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor} ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-base-300 tracking-wide">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-base-50">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Actions + Recent Matches */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-base-50">
          Recent Matches
        </h2>
        <div className="flex gap-3">
          <Link
            to="/jobs/new"
            className="rounded-lg border border-base-600 bg-base-800 px-4 py-2 text-sm font-medium text-base-100 hover:bg-base-700 hover:border-base-500 transition-all duration-200"
          >
            Add Job
          </Link>
          <Link
            to="/resumes/new"
            className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-base-950 hover:bg-neon-dim transition-all duration-200 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          >
            Add Resume
          </Link>
        </div>
      </div>

      {recentMatches.filter((m) => m.similarity_score >= 0.5).length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-base-700">
            <svg className="h-6 w-6 text-base-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <p className="text-base-300">No matches yet.</p>
          <p className="mt-1 text-sm text-base-400">
            Add jobs and resumes, then compute matches.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-600/50 bg-base-800/50 backdrop-blur-sm">
          <table className="min-w-full divide-y divide-base-600/50">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-widest text-base-300">
                  Job
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-widest text-base-300">
                  Candidate
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-widest text-base-300">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-700/50">
              {recentMatches
                .filter((m) => m.similarity_score >= 0.5)
                .map((m) => (
                  <tr key={m.id} className="hover:bg-base-700/30 transition-colors duration-150">
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        to={`/jobs/${m.job_id}`}
                        className="text-neon hover:text-neon-dim transition-colors duration-200"
                      >
                        {m.job_title ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        to={`/resumes/${m.resume_id}`}
                        className="text-violet-accent hover:text-violet-300 transition-colors duration-200"
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
