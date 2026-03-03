import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs } from "../api/client";
import type { Job } from "../types";
import DataTable from "../components/DataTable";

const PAGE_SIZE = 20;

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getJobs(page * PAGE_SIZE, PAGE_SIZE)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && page === 0) {
    return <p className="text-gray-500">Loading jobs...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <Link
          to="/jobs/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add Job
        </Link>
      </div>

      <DataTable
        columns={[
          {
            key: "title",
            header: "Title",
            render: (job) => (
              <Link
                to={`/jobs/${job.id}`}
                className="text-indigo-600 hover:underline"
              >
                {job.title}
              </Link>
            ),
          },
          {
            key: "company",
            header: "Company",
            render: (job) => job.company,
          },
          {
            key: "created_at",
            header: "Created",
            render: (job) => new Date(job.created_at).toLocaleDateString(),
          },
        ]}
        data={jobs}
        keyExtractor={(job) => job.id}
        page={page}
        onPageChange={setPage}
        hasMore={jobs.length === PAGE_SIZE}
      />
    </div>
  );
}
