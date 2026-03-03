import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResumes } from "../api/client";
import type { Resume } from "../types";
import DataTable from "../components/DataTable";

const PAGE_SIZE = 20;

export default function ResumesList() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getResumes(page * PAGE_SIZE, PAGE_SIZE)
      .then(setResumes)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && page === 0) {
    return (
      <div className="flex items-center gap-3 text-base-300 animate-fade-in">
        <div className="h-4 w-4 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
        Loading resumes...
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-base-50 tracking-tight">
            Resumes
          </h1>
          <p className="mt-1 text-base-300">Manage candidate resumes</p>
        </div>
        <Link
          to="/resumes/new"
          className="rounded-lg bg-neon px-5 py-2.5 text-sm font-semibold text-base-950 hover:bg-neon-dim transition-all duration-200 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
        >
          Add Resume
        </Link>
      </div>

      <DataTable
        columns={[
          {
            key: "candidate_name",
            header: "Candidate",
            render: (r) => (
              <Link
                to={`/resumes/${r.id}`}
                className="text-neon hover:text-neon-dim transition-colors duration-200 font-medium"
              >
                {r.candidate_name}
              </Link>
            ),
          },
          {
            key: "content",
            header: "Preview",
            render: (r) => (
              <span className="text-base-400">
                {r.content.slice(0, 80)}
                {r.content.length > 80 && "..."}
              </span>
            ),
          },
          {
            key: "created_at",
            header: "Created",
            render: (r) => (
              <span className="font-mono text-base-300 text-xs">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            ),
          },
        ]}
        data={resumes}
        keyExtractor={(r) => r.id}
        page={page}
        onPageChange={setPage}
        hasMore={resumes.length === PAGE_SIZE}
      />
    </div>
  );
}
