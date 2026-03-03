import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TextForm from "../TextForm";

const fields = [
  { name: "title", label: "Title", type: "text" as const, required: true },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    placeholder: "Enter description",
  },
];

describe("TextForm", () => {
  it("renders form title", () => {
    render(
      <TextForm
        title="Add Job"
        fields={fields}
        submitLabel="Create"
        onSubmit={async () => {}}
      />,
    );
    expect(screen.getByText("Add Job")).toBeInTheDocument();
  });

  it("renders all fields with labels", () => {
    render(
      <TextForm
        title="Add Job"
        fields={fields}
        submitLabel="Create"
        onSubmit={async () => {}}
      />,
    );
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("renders submit button with label", () => {
    render(
      <TextForm
        title="Add Job"
        fields={fields}
        submitLabel="Create"
        onSubmit={async () => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("calls onSubmit with form values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TextForm
        title="Add Job"
        fields={fields}
        submitLabel="Create"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Engineer" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Build stuff" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Engineer",
        description: "Build stuff",
      });
    });
  });

  it("shows error message on submit failure", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error("Network error"));
    const optionalFields = [
      { name: "title", label: "Title", type: "text" as const },
    ];
    render(
      <TextForm
        title="Add Job"
        fields={optionalFields}
        submitLabel="Create"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("shows Submitting... while loading", async () => {
    let resolveSubmit: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const optionalFields = [
      { name: "title", label: "Title", type: "text" as const },
    ];

    render(
      <TextForm
        title="Add Job"
        fields={optionalFields}
        submitLabel="Create"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(screen.getByText("Submitting...")).toBeInTheDocument();
    });

    resolveSubmit!();

    await waitFor(() => {
      expect(screen.getByText("Create")).toBeInTheDocument();
    });
  });
});
