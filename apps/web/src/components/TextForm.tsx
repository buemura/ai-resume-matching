import { useState } from "react";

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea";
  placeholder?: string;
  required?: boolean;
}

interface TextFormProps {
  title: string;
  fields: Field[];
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

export default function TextForm({
  title,
  fields,
  submitLabel,
  onSubmit,
}: TextFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, ""])),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="mb-8 font-display text-3xl font-bold text-base-50">
        {title}
      </h1>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-accent/30 bg-rose-accent/10 p-4 text-sm text-rose-accent">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="mb-2 block text-sm font-medium text-base-200"
            >
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                rows={8}
                className="w-full rounded-xl border border-base-600 bg-base-800 px-4 py-3 text-sm text-base-50 placeholder-base-400 focus:border-neon focus:ring-1 focus:ring-neon/30 focus:outline-none transition-all duration-200 resize-none"
              />
            ) : (
              <input
                id={field.name}
                type="text"
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full rounded-xl border border-base-600 bg-base-800 px-4 py-3 text-sm text-base-50 placeholder-base-400 focus:border-neon focus:ring-1 focus:ring-neon/30 focus:outline-none transition-all duration-200"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-base-950 hover:bg-neon-dim transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:shadow-[0_0_30px_rgba(0,240,255,0.25)]"
        >
          {loading ? "Submitting..." : submitLabel}
        </button>
      </form>
    </div>
  );
}
