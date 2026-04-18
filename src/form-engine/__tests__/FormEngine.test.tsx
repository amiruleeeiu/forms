import { renderWithProviders } from "@/test/utils";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { FormEngine } from "../FormEngine";
import type { NormalFormConfig } from "../types";

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
});

type FormValues = z.infer<typeof schema>;

const config: NormalFormConfig = {
  mode: "normal",
  submitLabel: "Register",
  resetLabel: "Clear",
  blocks: [
    {
      id: "personal",
      title: "Personal",
      layout: "single",
      fields: [
        { name: "fullName", type: "text", label: "Full Name", required: true },
        { name: "email", type: "email", label: "Email", required: true },
      ],
    },
  ],
};

function setup(onSubmit = vi.fn()) {
  const { user } = renderWithProviders(
    <FormEngine<FormValues>
      config={config}
      schema={schema}
      defaultValues={{ fullName: "", email: "" }}
      onSubmit={onSubmit}
    />,
  );
  return { user, onSubmit };
}

describe("FormEngine", () => {
  it("renders block title and all fields", () => {
    setup();
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });

  it("renders submit and reset buttons", () => {
    setup();
    expect(
      screen.getByRole("button", { name: /register/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /register/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Name must be at least 2 characters"),
      ).toBeInTheDocument();
    });
  });

  it("calls onSubmit with valid values", async () => {
    const onSubmit = vi.fn();
    const { user } = setup(onSubmit);

    await user.type(screen.getByLabelText(/Full Name/), "Alice");
    await user.type(screen.getByLabelText(/Email/), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        fullName: "Alice",
        email: "alice@example.com",
      });
    });
  });

  it("resets the form when reset button is clicked", async () => {
    const { user } = setup();
    const input = screen.getByLabelText(/Full Name/) as HTMLInputElement;

    await user.type(input, "Alice");
    expect(input.value).toBe("Alice");

    await user.click(screen.getByRole("button", { name: /clear/i }));
    await waitFor(() => expect(input.value).toBe(""));
  });

  it("renders conditional block based on showWhen", async () => {
    const conditionalConfig: NormalFormConfig = {
      mode: "normal",
      blocks: [
        {
          id: "toggle",
          layout: "single",
          fields: [
            { name: "showExtra", type: "checkbox", label: "Show Extra" },
          ],
        },
        {
          id: "extra",
          title: "Extra Block",
          layout: "single",
          showWhen: { field: "showExtra", operator: "truthy" },
          fields: [{ name: "note", type: "text", label: "Note" }],
        },
      ],
    };

    const extraSchema = z.object({
      showExtra: z.boolean().optional(),
      note: z.string().optional(),
    });
    const { user } = renderWithProviders(
      <FormEngine
        config={conditionalConfig}
        schema={extraSchema}
        defaultValues={{ showExtra: false }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText("Extra Block")).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /show extra/i }));
    await waitFor(() => {
      expect(screen.getByText("Extra Block")).toBeInTheDocument();
    });
  });
});
