import { renderWithProviders } from "@/test/utils";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { FormEngine } from "../FormEngine";
import type { StepFormConfig } from "../types";

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  city: z.string().min(1, "City is required"),
});

type FormValues = z.infer<typeof schema>;

const config: StepFormConfig = {
  mode: "stepped",
  submitLabel: "Complete",
  steps: [
    {
      id: "step-1",
      title: "Personal",
      description: "Your personal details",
      blocks: [
        {
          id: "personal-block",
          layout: "single",
          fields: [
            {
              name: "fullName",
              type: "text",
              label: "Full Name",
              required: true,
            },
            { name: "email", type: "email", label: "Email", required: true },
          ],
        },
      ],
    },
    {
      id: "step-2",
      title: "Location",
      description: "Where are you?",
      blocks: [
        {
          id: "location-block",
          layout: "single",
          fields: [
            { name: "city", type: "text", label: "City", required: true },
          ],
        },
      ],
    },
  ],
};

function setup(onSubmit = vi.fn()) {
  const { user } = renderWithProviders(
    <FormEngine<FormValues>
      config={config}
      schema={schema}
      defaultValues={{ fullName: "", email: "", city: "" }}
      onSubmit={onSubmit}
    />,
  );
  return { user, onSubmit };
}

describe("StepFormEngine", () => {
  it("renders the first step by default", () => {
    setup();
    // Step indicator + h2 both contain "Personal" — use heading role for the h2
    expect(
      screen.getByRole("heading", { name: "Personal" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your personal details")).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });

  it("does not show Back button on first step", () => {
    setup();
    expect(
      screen.queryByRole("button", { name: /back/i }),
    ).not.toBeInTheDocument();
  });

  it("does not show Submit button on first step", () => {
    setup();
    expect(
      screen.queryByRole("button", { name: /complete/i }),
    ).not.toBeInTheDocument();
  });

  it("shows validation errors and stays on step when Next clicked with invalid fields", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Name must be at least 2 characters"),
      ).toBeInTheDocument();
    });
    // Still on step 1
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
  });

  it("advances to step 2 when step 1 fields are valid", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/Full Name/), "Alice");
    await user.type(screen.getByLabelText(/Email/), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      // Step indicator + h2 both contain "Location" on step 2 — use heading role
      expect(
        screen.getByRole("heading", { name: "Location" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/City/)).toBeInTheDocument();
  });

  it("shows Back button on step 2 and goes back to step 1", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/Full Name/), "Alice");
    await user.type(screen.getByLabelText(/Email/), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() =>
      expect(screen.getByLabelText(/City/)).toBeInTheDocument(),
    );

    const backBtn = screen.getByRole("button", { name: /back/i });
    expect(backBtn).toBeInTheDocument();
    await user.click(backBtn);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    });
  });

  it("shows Submit button on last step", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/Full Name/), "Alice");
    await user.type(screen.getByLabelText(/Email/), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() =>
      expect(screen.getByLabelText(/City/)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: /complete/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /next/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onSubmit with complete values on final step", async () => {
    const onSubmit = vi.fn();
    const { user } = setup(onSubmit);

    await user.type(screen.getByLabelText(/Full Name/), "Alice");
    await user.type(screen.getByLabelText(/Email/), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() =>
      expect(screen.getByLabelText(/City/)).toBeInTheDocument(),
    );
    await user.type(screen.getByLabelText(/City/), "Dhaka");
    await user.click(screen.getByRole("button", { name: /complete/i }));

    await waitFor(() => {
      // RHF calls onSubmit(values, event) — check only the first argument (values)
      expect(onSubmit).toHaveBeenCalled();
      expect(onSubmit.mock.calls[0][0]).toEqual({
        fullName: "Alice",
        email: "alice@example.com",
        city: "Dhaka",
      });
    });
  });

  it("renders the StepIndicator with step titles", () => {
    setup();
    // StepIndicator renders step titles as text
    expect(screen.getAllByText("Personal").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Location")).toBeInTheDocument();
  });
});
