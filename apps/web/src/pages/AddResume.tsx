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
      <div className="mx-auto max-w-2xl animate-fade-in">
        <div className="mb-8 flex gap-2">
          <button className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-base-950 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
            Paste Text
          </button>
          <button
            onClick={() => setMode("upload")}
            className="rounded-lg border border-base-600 bg-base-800 px-4 py-2 text-sm font-medium text-base-200 hover:bg-base-700 hover:border-base-500 transition-all duration-200"
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
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-8 flex gap-2">
        <button
          onClick={() => setMode("paste")}
          className="rounded-lg border border-base-600 bg-base-800 px-4 py-2 text-sm font-medium text-base-200 hover:bg-base-700 hover:border-base-500 transition-all duration-200"
        >
          Paste Text
        </button>
        <button className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-base-950 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
          Upload File
        </button>
      </div>

      <h1 className="mb-8 font-display text-3xl font-bold text-base-50">
        Upload Resume File
      </h1>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-accent/30 bg-rose-accent/10 p-4 text-sm text-rose-accent">
          {error}
        </div>
      )}

      <form onSubmit={handleFileSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="candidate_name"
            className="mb-2 block text-sm font-medium text-base-200"
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
            className="w-full rounded-xl border border-base-600 bg-base-800 px-4 py-3 text-sm text-base-50 placeholder-base-400 focus:border-neon focus:ring-1 focus:ring-neon/30 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="mb-2 block text-sm font-medium text-base-200"
          >
            Resume File (PDF or DOCX)
          </label>
          <input
            id="file"
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="w-full rounded-xl border border-base-600 bg-base-800 px-4 py-3 text-sm text-base-200 file:mr-4 file:rounded-lg file:border-0 file:bg-neon/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-neon hover:file:bg-neon/20 transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-base-950 hover:bg-neon-dim transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:shadow-[0_0_30px_rgba(0,240,255,0.25)]"
        >
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
      </form>
    </div>
  );
}
