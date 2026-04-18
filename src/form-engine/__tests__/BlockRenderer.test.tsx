import { render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { BlockRenderer } from "../BlockRenderer";
import type { BlockConfig } from "../types";

function Wrapper({
  children,
  defaultValues = {},
}: {
  children: ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const form = useForm({ defaultValues });
  return <FormProvider {...form}>{children}</FormProvider>;
}

function renderBlock(
  config: BlockConfig,
  defaultValues: Record<string, unknown> = {},
) {
  return render(
    <Wrapper defaultValues={defaultValues}>
      <BlockRenderer config={config} />
    </Wrapper>,
  );
}

const SIMPLE_BLOCK: BlockConfig = {
  id: "personal",
  title: "Personal Info",
  description: "Tell us about you",
  layout: "single",
  fields: [
    { name: "fullName", type: "text", label: "Full Name" },
    { name: "email", type: "email", label: "Email" },
  ],
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("BlockRenderer — rendering", () => {
  it("renders the block title and description", () => {
    renderBlock(SIMPLE_BLOCK);
    expect(screen.getByText("Personal Info")).toBeInTheDocument();
    expect(screen.getByText("Tell us about you")).toBeInTheDocument();
  });

  it("renders all fields inside the block", () => {
    renderBlock(SIMPLE_BLOCK);
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders without title or description", () => {
    const block: BlockConfig = {
      id: "b1",
      layout: "single",
      fields: [{ name: "x", type: "text", label: "X" }],
    };
    renderBlock(block);
    expect(screen.getByLabelText("X")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// showWhen / hideWhen
// ---------------------------------------------------------------------------

describe("BlockRenderer — showWhen", () => {
  const block: BlockConfig = {
    id: "insurance",
    title: "Insurance Details",
    layout: "single",
    showWhen: { field: "hasInsurance", operator: "truthy" },
    fields: [{ name: "provider", type: "text", label: "Provider" }],
  };

  it("renders block when showWhen is satisfied", () => {
    renderBlock(block, { hasInsurance: true });
    expect(screen.getByText("Insurance Details")).toBeInTheDocument();
    expect(screen.getByLabelText("Provider")).toBeInTheDocument();
  });

  it("hides block when showWhen is not satisfied", () => {
    renderBlock(block, { hasInsurance: false });
    expect(screen.queryByText("Insurance Details")).not.toBeInTheDocument();
  });
});

describe("BlockRenderer — hideWhen", () => {
  const block: BlockConfig = {
    id: "info",
    title: "Extra Info",
    layout: "single",
    hideWhen: { field: "mode", operator: "eq", value: "simple" },
    fields: [{ name: "extra", type: "text", label: "Extra" }],
  };

  it("hides block when hideWhen is satisfied", () => {
    renderBlock(block, { mode: "simple" });
    expect(screen.queryByText("Extra Info")).not.toBeInTheDocument();
  });

  it("renders block when hideWhen is not satisfied", () => {
    renderBlock(block, { mode: "advanced" });
    expect(screen.getByText("Extra Info")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Layout classes
// ---------------------------------------------------------------------------

describe("BlockRenderer — layout", () => {
  it("applies 2-col grid class", () => {
    const { container } = renderBlock({
      id: "grid",
      layout: "2-col",
      fields: [
        { name: "a", type: "text", label: "A" },
        { name: "b", type: "text", label: "B" },
      ],
    });
    const grid = container.querySelector(".md\\:grid-cols-2");
    expect(grid).toBeInTheDocument();
  });

  it("applies 3-col grid class", () => {
    const { container } = renderBlock({
      id: "grid3",
      layout: "3-col",
      fields: [
        { name: "a", type: "text", label: "A" },
        { name: "b", type: "text", label: "B" },
        { name: "c", type: "text", label: "C" },
      ],
    });
    const grid = container.querySelector(".md\\:grid-cols-3");
    expect(grid).toBeInTheDocument();
  });
});
