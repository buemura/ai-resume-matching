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
    return <p className="text-gray-500">Loading resumes...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
        <Link
          to="/resumes/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
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
                className="text-indigo-600 hover:underline"
              >
                {r.candidate_name}
              </Link>
            ),
          },
          {
            key: "content",
            header: "Preview",
            render: (r) => (
              <span className="text-gray-500">
                {r.content.slice(0, 80)}
                {r.content.length > 80 && "..."}
              </span>
            ),
          },
          {
            key: "created_at",
            header: "Created",
            render: (r) => new Date(r.created_at).toLocaleDateString(),
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
