import {
  FormEngine,
  buildDefaultValues,
  buildSchemaFromConfig,
} from "@/form-engine";
import { renderWithProviders } from "@/test/utils";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { stepFormConfig } from "./stepFormConfig";

// Derive schema from config but skip E.164 phone validation for simpler test
// navigation (avoids needing a real carrier-valid number in tests).
const testConfig = {
  ...stepFormConfig,
  steps: stepFormConfig.steps.map((step) => ({
    ...step,
    blocks: step.blocks.map((block) => ({
      ...block,
      fields: block.fields.map((field) =>
        field.type === "phone"
          ? {
              ...field,
              validation: { ...field.validation, validatePhone: false },
            }
          : field,
      ),
    })),
  })),
} as typeof stepFormConfig;

const testSchema = buildSchemaFromConfig(testConfig);
const testDefaults = buildDefaultValues(testConfig);

function setup() {
  const onSubmit = vi.fn();
  const { user } = renderWithProviders(
    <FormEngine
      config={stepFormConfig}
      schema={testSchema}
      defaultValues={testDefaults as never}
      onSubmit={onSubmit}
    />,
  );
  return { user, onSubmit };
}

// ---------------------------------------------------------------------------
// Step 1: Personal
// ---------------------------------------------------------------------------

describe("StepForm — Step 1 (Personal)", () => {
  it("renders step 1 fields on load", () => {
    setup();
    // Step indicator + h2 both contain "Personal" — use heading role for the h2
    expect(
      screen.getByRole("heading", { name: "Personal" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });

  it("blocks Next when step 1 is empty", async () => {
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
});

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

async function goToStep2(user: ReturnType<typeof renderWithProviders>["user"]) {
  await user.type(screen.getByLabelText(/Full Name/), "Alice");
  await user.type(screen.getByLabelText(/Email/), "alice@example.com");
  // PhoneInputField wraps the input in a div; find by placeholder instead of label
  const phoneInput = screen.getByPlaceholderText("Enter phone number");
  await user.type(phoneInput, "+8801700000000");
  await user.click(screen.getByRole("button", { name: /next/i }));
  // "Address" appears in both the step indicator and the h2 — use heading role
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Address" }),
    ).toBeInTheDocument(),
  );
}

async function goToStep3(user: ReturnType<typeof renderWithProviders>["user"]) {
  await goToStep2(user);
  // Country is required on step 2
  // Use the combobox trigger for country
  const countrySelect = screen.getByRole("combobox", { name: /country/i });
  await user.click(countrySelect);
  const option = await screen.findByRole("option", { name: /bangladesh/i });
  await user.click(option);
  await user.click(screen.getByRole("button", { name: /next/i }));
  // "Preferences" appears in both the step indicator and the h2 — use heading role
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Preferences" }),
    ).toBeInTheDocument(),
  );
}

// ---------------------------------------------------------------------------
// Step 2: Address
// ---------------------------------------------------------------------------

describe("StepForm — Step 2 (Address)", () => {
  it("shows address fields after advancing from step 1", async () => {
    const { user } = setup();
    await goToStep2(user);
    expect(
      screen.getByRole("combobox", { name: /country/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /district/i }),
    ).toBeInTheDocument();
  });

  it("district is disabled until country is selected", async () => {
    const { user } = setup();
    await goToStep2(user);
    expect(screen.getByRole("combobox", { name: /district/i })).toBeDisabled();
  });

  it("Back button returns to step 1", async () => {
    const { user } = setup();
    await goToStep2(user);
    await user.click(screen.getByRole("button", { name: /back/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    });
  });

  it("blocks Next when country is empty", async () => {
    const { user } = setup();
    await goToStep2(user);
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText("Country is required")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Step 3: Preferences — conditional insurance block
// ---------------------------------------------------------------------------

describe("StepForm — Step 3 (Preferences)", () => {
  it("insurance details block is hidden by default", async () => {
    const { user } = setup();
    await goToStep3(user);
    expect(screen.queryByText("Insurance Details")).not.toBeInTheDocument();
  });

  it("insurance block appears when hasInsurance checked", async () => {
    const { user } = setup();
    await goToStep3(user);

    await user.click(
      screen.getByRole("checkbox", { name: /i have health insurance/i }),
    );
    await waitFor(() => {
      expect(screen.getByText("Insurance Details")).toBeInTheDocument();
    });
  });

  it("blocks Next when no skill selected", async () => {
    const { user } = setup();
    await goToStep3(user);
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText("Select at least one skill")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Step 4: Terms
// ---------------------------------------------------------------------------

describe("StepForm — Step 4 (Terms)", () => {
  async function goToStep4(
    user: ReturnType<typeof renderWithProviders>["user"],
  ) {
    await goToStep3(user);
    // Select a skill
    await user.click(screen.getByRole("checkbox", { name: /react/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    // "Terms" appears in both the step indicator and the h2 — use heading role
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Terms" }),
      ).toBeInTheDocument(),
    );
  }

  it("shows terms checkbox on step 4", async () => {
    const { user } = setup();
    await goToStep4(user);
    expect(
      screen.getByRole("checkbox", { name: /i accept the terms/i }),
    ).toBeInTheDocument();
  });

  it("shows Submit button on step 4 (not Next)", async () => {
    const { user } = setup();
    await goToStep4(user);
    expect(
      screen.getByRole("button", { name: /complete registration/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /next/i }),
    ).not.toBeInTheDocument();
  });

  it("blocks submit when terms not accepted", async () => {
    const { user } = setup();
    await goToStep4(user);
    await user.click(
      screen.getByRole("button", { name: /complete registration/i }),
    );
    await waitFor(() => {
      expect(screen.getByText("You must accept the terms")).toBeInTheDocument();
    });
  });

  it("calls onSubmit after accepting terms and submitting", async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(
      <FormEngine
        config={stepFormConfig}
        schema={testSchema}
        defaultValues={testDefaults as never}
        onSubmit={onSubmit}
      />,
    );

    await goToStep4(user);
    await user.click(
      screen.getByRole("checkbox", { name: /i accept the terms/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /complete registration/i }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
