import { render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { FieldRenderer } from "../FieldRenderer";
import type { FieldConfig } from "../types";

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

function renderField(
  config: FieldConfig,
  defaultValues: Record<string, unknown> = {},
) {
  return render(
    <Wrapper defaultValues={defaultValues}>
      <FieldRenderer config={config} />
    </Wrapper>,
  );
}

// ---------------------------------------------------------------------------
// Renders correct component per type
// ---------------------------------------------------------------------------

describe("FieldRenderer — type dispatch", () => {
  it("renders a text input for type=text", () => {
    renderField({ name: "fullName", type: "text", label: "Full Name" });
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
  });

  it("renders an email input for type=email", () => {
    renderField({ name: "email", type: "email", label: "Email" });
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });

  it("renders a number input for type=number", () => {
    renderField({ name: "age", type: "number", label: "Age" });
    expect(screen.getByLabelText("Age")).toHaveAttribute("type", "number");
  });

  it("renders a checkbox for type=checkbox", () => {
    renderField({ name: "agree", type: "checkbox", label: "Agree" });
    expect(
      screen.getByRole("checkbox", { name: /agree/i }),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// hide — static hide
// ---------------------------------------------------------------------------

describe("FieldRenderer — hide prop", () => {
  it("renders nothing when hide=true", () => {
    renderField({ name: "userId", type: "text", label: "User ID", hide: true });
    expect(screen.queryByLabelText("User ID")).not.toBeInTheDocument();
  });

  it("renders normally when hide=false", () => {
    renderField({
      name: "userId",
      type: "text",
      label: "User ID",
      hide: false,
    });
    expect(screen.getByLabelText("User ID")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// showWhen
// ---------------------------------------------------------------------------

describe("FieldRenderer — showWhen", () => {
  it("renders when showWhen condition is true", () => {
    renderField(
      {
        name: "insuranceProvider",
        type: "text",
        label: "Provider",
        showWhen: { field: "hasInsurance", operator: "truthy" },
      },
      { hasInsurance: true },
    );
    expect(screen.getByLabelText("Provider")).toBeInTheDocument();
  });

  it("hides when showWhen condition is false", () => {
    renderField(
      {
        name: "insuranceProvider",
        type: "text",
        label: "Provider",
        showWhen: { field: "hasInsurance", operator: "truthy" },
      },
      { hasInsurance: false },
    );
    expect(screen.queryByLabelText("Provider")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// hideWhen
// ---------------------------------------------------------------------------

describe("FieldRenderer — hideWhen", () => {
  it("hides when hideWhen condition is true", () => {
    renderField(
      {
        name: "note",
        type: "text",
        label: "Note",
        hideWhen: { field: "mode", operator: "eq", value: "simple" },
      },
      { mode: "simple" },
    );
    expect(screen.queryByLabelText("Note")).not.toBeInTheDocument();
  });

  it("renders when hideWhen condition is false", () => {
    renderField(
      {
        name: "note",
        type: "text",
        label: "Note",
        hideWhen: { field: "mode", operator: "eq", value: "simple" },
      },
      { mode: "advanced" },
    );
    expect(screen.getByLabelText("Note")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// disableWhen
// ---------------------------------------------------------------------------

describe("FieldRenderer — disableWhen", () => {
  it("disables the field when disableWhen condition is true", () => {
    renderField(
      {
        name: "district",
        type: "text",
        label: "District",
        disableWhen: { field: "country", operator: "falsy" },
      },
      { country: "" },
    );
    expect(screen.getByLabelText("District")).toBeDisabled();
  });

  it("enables the field when disableWhen condition is false", () => {
    renderField(
      {
        name: "district",
        type: "text",
        label: "District",
        disableWhen: { field: "country", operator: "falsy" },
      },
      { country: "bd" },
    );
    expect(screen.getByLabelText("District")).not.toBeDisabled();
  });
});
