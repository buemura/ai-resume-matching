import { useNavigate } from "react-router-dom";
import { createJob } from "../api/client";
import TextForm from "../components/TextForm";

export default function AddJob() {
  const navigate = useNavigate();

  return (
    <TextForm
      title="Add Job Posting"
      fields={[
        {
          name: "title",
          label: "Job Title",
          type: "text",
          placeholder: "e.g. Senior Software Engineer",
          required: true,
        },
        {
          name: "company",
          label: "Company",
          type: "text",
          placeholder: "e.g. Acme Corp",
          required: true,
        },
        {
          name: "description",
          label: "Job Description",
          type: "textarea",
          placeholder: "Paste the full job description here...",
          required: true,
        },
      ]}
      submitLabel="Create Job"
      onSubmit={async (values) => {
        const job = await createJob({
          title: values.title,
          company: values.company,
          description: values.description,
        });
        navigate(`/jobs/${job.id}`);
      }}
    />
  );
}
