import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createResume, uploadResume } from "../api/client";
import TextForm from "../components/TextForm";

type Mode = "paste" | "upload";

export default function AddResume() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("paste");
  const [candidateName, setCandidateName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !candidateName.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const resume = await uploadResume(candidateName, file);
      navigate(`/resumes/${resume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (mode === "paste") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex gap-2">
          <button
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            Paste Text
          </button>
          <button
            onClick={() => setMode("upload")}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Upload File
          </button>
        </div>
        <TextForm
          title="Add Resume"
          fields={[
            {
              name: "candidate_name",
              label: "Candidate Name",
              type: "text",
              placeholder: "e.g. Jane Doe",
              required: true,
            },
            {
              name: "content",
              label: "Resume Content",
              type: "textarea",
              placeholder: "Paste the full resume text here...",
              required: true,
            },
          ]}
          submitLabel="Upload Resume"
          onSubmit={async (values) => {
            const resume = await createResume({
              candidate_name: values.candidate_name,
              content: values.content,
            });
            navigate(`/resumes/${resume.id}`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setMode("paste")}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Paste Text
        </button>
        <button
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          Upload File
        </button>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Upload Resume File
      </h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleFileSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="candidate_name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Candidate Name
          </label>
          <input
            id="candidate_name"
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="e.g. Jane Doe"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Resume File (PDF or DOCX)
          </label>
          <input
            id="file"
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
      </form>
    </div>
  );
}
