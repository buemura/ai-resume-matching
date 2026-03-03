import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DataTable from "../DataTable";

interface Item {
  id: string;
  name: string;
}

const columns = [
  { key: "name", header: "Name", render: (item: Item) => item.name },
];

const sampleData: Item[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        keyExtractor={(i) => i.id}
        page={0}
        onPageChange={() => {}}
        hasMore={false}
      />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        keyExtractor={(i) => i.id}
        page={0}
        onPageChange={() => {}}
        hasMore={false}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows empty message when no data", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(i: Item) => i.id}
        page={0}
        onPageChange={() => {}}
        hasMore={false}
      />,
    );
    expect(screen.getByText("No data found.")).toBeInTheDocument();
  });

  it("disables Previous button on first page", () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        keyExtractor={(i) => i.id}
        page={0}
        onPageChange={() => {}}
        hasMore={true}
      />,
    );
    expect(screen.getByText("Previous")).toBeDisabled();
  });

  it("disables Next button when no more data", () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        keyExtractor={(i) => i.id}
        page={0}
        onPageChange={() => {}}
        hasMore={false}
      />,
    );
    expect(screen.getByText("Next")).toBeDisabled();
  });

  it("calls onPageChange when clicking Next", () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        keyExtractor={(i) => i.id}
        page={0}
        onPageChange={onPageChange}
        hasMore={true}
      />,
    );
    fireEvent.click(screen.getByText("Next"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange when clicking Previous", () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        keyExtractor={(i) => i.id}
        page={2}
        onPageChange={onPageChange}
        hasMore={true}
      />,
    );
    fireEvent.click(screen.getByText("Previous"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("shows correct page info", () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        keyExtractor={(i) => i.id}
        page={1}
        onPageChange={() => {}}
        hasMore={false}
      />,
    );
    expect(screen.getByText(/page 2/)).toBeInTheDocument();
  });
});
