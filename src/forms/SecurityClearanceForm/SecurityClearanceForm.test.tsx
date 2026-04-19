import {
  FormEngine,
  buildDefaultValues,
  buildSchemaFromConfig,
} from "@/form-engine";
import { renderWithProviders } from "@/test/utils";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { securityClearanceFormConfig } from "./securityClearanceFormConfig";

// Disable E.164 phone validation so tests can use simple placeholder numbers.
// Make all file fields optional so navigation helpers can advance without uploads.
const testConfig = {
  ...securityClearanceFormConfig,
  steps: securityClearanceFormConfig.steps.map((step) => ({
    ...step,
    blocks: step.blocks.map((block) => ({
      ...block,
      fields: block.fields.map((field) => {
        if (field.type === "phone")
          return {
            ...field,
            validation: { ...field.validation, validatePhone: false },
          };
        if (field.type === "file") return { ...field, required: false };
        return field;
      }),
    })),
  })),
} as typeof securityClearanceFormConfig;

const testSchema = buildSchemaFromConfig(testConfig);
const testDefaults = buildDefaultValues(testConfig);

function setup() {
  const onSubmit = vi.fn();
  const { user } = renderWithProviders(
    <FormEngine
      config={testConfig}
      schema={testSchema}
      defaultValues={testDefaults as never}
      onSubmit={onSubmit}
    />,
  );
  return { user, onSubmit };
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

async function advanceFromStep1(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Basic Instructions" }),
    ).toBeInTheDocument(),
  );
  await user.type(
    screen.getByLabelText(/work permit reference/i),
    "WP-2024-001",
  );
  await user.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Bank Details" }),
    ).toBeInTheDocument(),
  );
}

async function advanceFromStep2(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  await advanceFromStep1(user);
  await user.type(screen.getByLabelText(/account holder name/i), "John Doe");
  await user.type(screen.getByLabelText(/bank name/i), "Dutch Bangla Bank");
  await user.type(screen.getByLabelText(/branch name/i), "Gulshan");
  await user.type(screen.getByLabelText(/bank account number/i), "1234567890");
  await user.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Tax Identification Details" }),
    ).toBeInTheDocument(),
  );
}

async function advanceFromStep3(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  await advanceFromStep2(user);
  await user.type(
    screen.getByLabelText(/tax identification number/i),
    "123456789012",
  );
  await user.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Residential Address" }),
    ).toBeInTheDocument(),
  );
}

async function fillForeignAddress(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  // Foreign Country — searchable-select combobox
  const countryCombo = screen.getByRole("combobox", { name: /country/i });
  await user.click(countryCombo);
  const japanOption = await screen.findByRole("option", { name: /japan/i });
  await user.click(japanOption);
  await user.type(screen.getByLabelText(/city \/ town/i), "Tokyo");
  // Case-sensitive: foreign label is "Postal Code / ZIP Code" (all-caps ZIP)
  await user.type(
    screen.getByLabelText(/postal code \/ zip code/i),
    "100-0001",
  );
  await user.type(screen.getByLabelText(/street address/i), "1-1 Marunouchi");
}

async function fillSelfArrangementCurrentAddress(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  // Accommodation Type
  await user.click(
    screen.getByRole("radio", { name: /self arrangement by expatriate/i }),
  );
  // Accommodation Status
  await waitFor(() =>
    expect(screen.getByRole("radio", { name: /current/i })).toBeInTheDocument(),
  );
  await user.click(screen.getByRole("radio", { name: /current/i }));

  // Wait for Current Address block
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: /current address/i }),
    ).toBeInTheDocument(),
  );

  // Division
  const divisionCombo = screen.getByRole("combobox", { name: /division/i });
  await user.click(divisionCombo);
  await user.click(await screen.findByRole("option", { name: /dhaka/i }));

  // District
  const districtCombo = screen.getByRole("combobox", { name: /district/i });
  await user.click(districtCombo);
  await user.click(await screen.findByRole("option", { name: /^dhaka$/i }));

  // Police Station
  const psCombo = screen.getByRole("combobox", { name: /police station/i });
  await user.click(psCombo);
  await user.click(await screen.findByRole("option", { name: /mirpur/i }));

  await user.type(screen.getByLabelText(/post office/i), "Mirpur Post Office");
  // Case-sensitive regex: local label is "Postal Code / Zip Code" (mixed case Zip, not ZIP)
  // This avoids matching the foreign "Postal Code / ZIP Code" field.
  await user.type(screen.getByLabelText(/Postal Code \/ Zip Code/), "1216");
  await user.type(screen.getByLabelText(/^area/i), "Mirpur 10");
  await user.type(screen.getByLabelText(/^road/i), "Road 5");
  await user.type(screen.getByLabelText(/^flat/i), "Apt 3B");
  await user.type(screen.getByLabelText(/^house/i), "House 12");

  // PhoneInputField doesn't forward the label to the text input — use placeholder
  const phoneInput = screen.getByPlaceholderText("Enter phone number");
  await user.type(phoneInput, "01711223344");

  await user.type(screen.getByLabelText(/^email/i), "john@example.com");
}

async function advanceFromStep4(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  await advanceFromStep3(user);
  await fillForeignAddress(user);
  await fillSelfArrangementCurrentAddress(user);
  await user.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Previous Passport Details" }),
    ).toBeInTheDocument(),
  );
}

async function advanceFromStep5(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  await advanceFromStep4(user);
  await user.click(screen.getByRole("radio", { name: /^no$/i }));
  await user.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Attachments" }),
    ).toBeInTheDocument(),
  );
}

async function advanceFromStep6(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  await advanceFromStep5(user);
  // File fields are optional in testConfig — advance straight through
  await user.click(screen.getByRole("button", { name: /next/i }));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Declarations" }),
    ).toBeInTheDocument(),
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Basic Instructions
// ---------------------------------------------------------------------------

describe("SecurityClearanceForm — Step 1 (Basic Instructions)", () => {
  it("renders work permit reference field on load", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: "Basic Instructions" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/work permit reference/i)).toBeInTheDocument();
  });

  it("blocks Next when work permit reference is empty", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/work permit reference/i)).toBeInTheDocument();
  });

  it("advances to Step 2 when work permit is provided", async () => {
    const { user } = setup();
    await user.type(
      screen.getByLabelText(/work permit reference/i),
      "WP-2024-001",
    );
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Bank Details" }),
      ).toBeInTheDocument(),
    );
  });

  it("shows no Back button on step 1", () => {
    setup();
    expect(
      screen.queryByRole("button", { name: /back/i }),
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Step 2 — Bank Details
// ---------------------------------------------------------------------------

describe("SecurityClearanceForm — Step 2 (Bank Details)", () => {
  it("renders all bank detail fields", async () => {
    const { user } = setup();
    await advanceFromStep1(user);
    expect(screen.getByLabelText(/account holder name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bank name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/branch name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bank account number/i)).toBeInTheDocument();
  });

  it("blocks Next when bank fields are empty", async () => {
    const { user } = setup();
    await advanceFromStep1(user);
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      const errors = screen.getAllByText(/this field is required/i);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByLabelText(/account holder name/i)).toBeInTheDocument();
  });

  it("Back returns to step 1", async () => {
    const { user } = setup();
    await advanceFromStep1(user);
    await user.click(screen.getByRole("button", { name: /back/i }));
    await waitFor(() =>
      expect(
        screen.getByLabelText(/work permit reference/i),
      ).toBeInTheDocument(),
    );
  });
});

// ---------------------------------------------------------------------------
// Step 3 — Tax Identification Details
// ---------------------------------------------------------------------------

describe("SecurityClearanceForm — Step 3 (Tax Identification)", () => {
  it("renders TIN field", async () => {
    const { user } = setup();
    await advanceFromStep2(user);
    expect(
      screen.getByLabelText(/tax identification number/i),
    ).toBeInTheDocument();
  });

  it("blocks Next when TIN is empty", async () => {
    const { user } = setup();
    await advanceFromStep2(user);
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() =>
      expect(screen.getByText(/this field is required/i)).toBeInTheDocument(),
    );
  });

  it("shows validation error for invalid TIN (not 12 digits)", async () => {
    const { user } = setup();
    await advanceFromStep2(user);
    await user.type(screen.getByLabelText(/tax identification number/i), "123");
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() =>
      expect(screen.getByText(/valid 12-digit tin/i)).toBeInTheDocument(),
    );
  });

  it("accepts a valid 12-digit TIN and advances", async () => {
    const { user } = setup();
    await advanceFromStep2(user);
    await user.type(
      screen.getByLabelText(/tax identification number/i),
      "123456789012",
    );
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Residential Address" }),
      ).toBeInTheDocument(),
    );
  });
});

// ---------------------------------------------------------------------------
// Step 4 — Residential Address
// ---------------------------------------------------------------------------

describe("SecurityClearanceForm — Step 4 (Residential Address)", () => {
  it("renders foreign address fields", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    expect(
      screen.getByRole("combobox", { name: /country/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/city \/ town/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
  });

  it("renders Accommodation Type radio buttons", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    expect(
      screen.getByRole("radio", { name: /arranged by company/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /self arrangement/i }),
    ).toBeInTheDocument();
  });

  it("blocks Next when accommodation type not selected", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    await fillForeignAddress(user);
    await user.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() =>
      expect(
        screen.getAllByText(/this field is required/i).length,
      ).toBeGreaterThanOrEqual(1),
    );
    expect(
      screen.getByRole("heading", { name: "Residential Address" }),
    ).toBeInTheDocument();
  });

  it("self-arrangement shows Accommodation Status radios", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    await user.click(screen.getByRole("radio", { name: /self arrangement/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /^current$/i }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("radio", { name: /^temporary$/i }),
    ).toBeInTheDocument();
  });

  it("self-arrangement current shows Current Address block", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    await user.click(screen.getByRole("radio", { name: /self arrangement/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /^current$/i }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("radio", { name: /^current$/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /current address/i }),
      ).toBeInTheDocument(),
    );
  });

  it("self-arrangement temporary shows Temporary Address block + expected date", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    await user.click(screen.getByRole("radio", { name: /self arrangement/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /^temporary$/i }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("radio", { name: /^temporary$/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /temporary address/i }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByLabelText(/expected date for regular residence/i),
    ).toBeInTheDocument();
  });

  it("company arrangement shows Rented/Owned radios", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    await user.click(
      screen.getByRole("radio", { name: /arranged by company/i }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /rented by company/i }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("radio", { name: /company owned/i }),
    ).toBeInTheDocument();
  });

  it("company-owned shows Within Factory / Outside Factory radios", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    await user.click(
      screen.getByRole("radio", { name: /arranged by company/i }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /company owned/i }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("radio", { name: /company owned/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /within factory/i }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("radio", { name: /outside factory/i }),
    ).toBeInTheDocument();
  });

  it("within-factory shows Factory Address block", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    await user.click(
      screen.getByRole("radio", { name: /arranged by company/i }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /company owned/i }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("radio", { name: /company owned/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /within factory/i }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("radio", { name: /within factory/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /factory address/i }),
      ).toBeInTheDocument(),
    );
  });

  it("switching accommodation type resets status fields", async () => {
    const { user } = setup();
    await advanceFromStep3(user);
    // Select self-arrangement then company-arrangement
    await user.click(screen.getByRole("radio", { name: /self arrangement/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /^current$/i }),
      ).toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("radio", { name: /arranged by company/i }),
    );
    // Self-accommodation status block should be hidden
    await waitFor(() =>
      expect(
        screen.queryByRole("radio", { name: /^current$/i }),
      ).not.toBeInTheDocument(),
    );
  });

  it("advances to step 5 when all required address fields are filled", async () => {
    const { user } = setup();
    await advanceFromStep4(user);
    expect(
      screen.getByRole("heading", { name: "Previous Passport Details" }),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Step 5 — Previous Passport Details
// ---------------------------------------------------------------------------

describe("SecurityClearanceForm — Step 5 (Previous Passport Details)", () => {
  it("renders the passport toggle radio", async () => {
    const { user } = setup();
    await advanceFromStep4(user);
    expect(screen.getByRole("radio", { name: /^yes$/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^no$/i })).toBeInTheDocument();
  });

  it("passport fields are hidden when No is selected", async () => {
    const { user } = setup();
    await advanceFromStep4(user);
    await user.click(screen.getByRole("radio", { name: /^no$/i }));
    expect(screen.queryByLabelText(/passport no\./i)).not.toBeInTheDocument();
  });

  it("passport fields appear when Yes is selected", async () => {
    const { user } = setup();
    await advanceFromStep4(user);
    await user.click(screen.getByRole("radio", { name: /^yes$/i }));
    await waitFor(() =>
      expect(screen.getByLabelText(/passport no\./i)).toBeInTheDocument(),
    );
    expect(screen.getByLabelText(/^personal no\./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nationality/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/issuing authority/i)).toBeInTheDocument();
  });

  it("Add Another Passport button appends a second entry", async () => {
    const { user } = setup();
    await advanceFromStep4(user);
    await user.click(screen.getByRole("radio", { name: /^yes$/i }));
    await waitFor(() =>
      expect(screen.getByLabelText(/passport no\./i)).toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", { name: /add another passport/i }),
    );
    await waitFor(() => {
      const passportInputs = screen.getAllByLabelText(/passport no\./i);
      expect(passportInputs).toHaveLength(2);
    });
  });

  it("Remove button removes the second passport entry", async () => {
    const { user } = setup();
    await advanceFromStep4(user);
    await user.click(screen.getByRole("radio", { name: /^yes$/i }));
    await waitFor(() =>
      expect(screen.getByLabelText(/passport no\./i)).toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", { name: /add another passport/i }),
    );
    await waitFor(() =>
      expect(screen.getAllByLabelText(/passport no\./i)).toHaveLength(2),
    );
    // Remove the second entry
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await user.click(removeButtons[removeButtons.length - 1]);
    await waitFor(() =>
      expect(screen.getAllByLabelText(/passport no\./i)).toHaveLength(1),
    );
  });

  it("Remove button is absent when only one passport entry exists (minItems=1)", async () => {
    const { user } = setup();
    await advanceFromStep4(user);
    await user.click(screen.getByRole("radio", { name: /^yes$/i }));
    await waitFor(() =>
      expect(screen.getByLabelText(/passport no\./i)).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: /remove/i }),
    ).not.toBeInTheDocument();
  });

  it("advances to Attachments when No is selected", async () => {
    const { user } = setup();
    await advanceFromStep5(user);
    expect(
      screen.getByRole("heading", { name: "Attachments" }),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Step 6 — Attachments
// ---------------------------------------------------------------------------

describe("SecurityClearanceForm — Step 6 (Attachments)", () => {
  it("renders required attachment labels", async () => {
    const { user } = setup();
    await advanceFromStep5(user);
    expect(screen.getByText(/passport of the employees/i)).toBeInTheDocument();
    expect(screen.getByText(/appointment letter/i)).toBeInTheDocument();
    expect(screen.getByText(/curriculum vitae/i)).toBeInTheDocument();
    expect(screen.getByText(/trade license/i)).toBeInTheDocument();
    expect(screen.getByText(/income tax clearance/i)).toBeInTheDocument();
    expect(screen.getByText(/specific activities/i)).toBeInTheDocument();
    expect(screen.getByText(/statement of the manpower/i)).toBeInTheDocument();
  });

  it("renders optional attachment labels", async () => {
    const { user } = setup();
    await advanceFromStep5(user);
    expect(screen.getByText(/work permit/i)).toBeInTheDocument();
    expect(screen.getByText(/encashment certificate/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Step 7 — Declarations
// ---------------------------------------------------------------------------

describe("SecurityClearanceForm — Step 7 (Declarations)", () => {
  it("renders declaration fields on last step", async () => {
    const { user } = setup();
    await advanceFromStep6(user);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/designation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /i hereby declare/i }),
    ).toBeInTheDocument();
  });

  it("shows Preview & Submit button (not Next) on last step", async () => {
    const { user } = setup();
    await advanceFromStep6(user);
    expect(
      screen.getByRole("button", { name: /preview & submit/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^next$/i }),
    ).not.toBeInTheDocument();
  });

  it("blocks submission when declaration checkbox is unchecked", async () => {
    const { user } = setup();
    await advanceFromStep6(user);
    await user.type(screen.getByLabelText(/full name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/designation/i), "HR Manager");
    await user.type(
      screen.getByLabelText(/email address/i),
      "jane@example.com",
    );
    await user.click(screen.getByRole("button", { name: /preview & submit/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/you must accept the declaration/i),
      ).toBeInTheDocument(),
    );
  });

  it("submits when all declaration fields are filled and checkbox checked", async () => {
    const { user, onSubmit } = setup();
    await advanceFromStep6(user);
    await user.type(screen.getByLabelText(/full name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/designation/i), "HR Manager");
    // Phone — PhoneInputField doesn't forward label to text input
    const phoneInput = screen.getByPlaceholderText("Enter phone number");
    await user.type(phoneInput, "01700000000");
    await user.type(
      screen.getByLabelText(/email address/i),
      "jane@example.com",
    );
    await user.click(
      screen.getByRole("checkbox", { name: /i hereby declare/i }),
    );
    await user.click(screen.getByRole("button", { name: /preview & submit/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("Submit button (not Next) appears on the last step", async () => {
    const { user } = setup();
    await advanceFromStep5(user);
    // Step 6 (Attachments) still shows Next
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /preview & submit/i }),
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Schema unit tests (no rendering)
// ---------------------------------------------------------------------------

describe("SecurityClearanceForm — Schema", () => {
  it("buildDefaultValues produces defaults for all fields", () => {
    const defaults = buildDefaultValues(testConfig);
    expect(defaults).toHaveProperty("workPermitRef", "");
    expect(defaults).toHaveProperty("accountHolderName", "");
    expect(defaults).toHaveProperty("tinNumber", "");
    expect(defaults).toHaveProperty("accommodationType", "");
    expect(defaults).toHaveProperty("hasPreviousPassport", "");
    expect(defaults).toHaveProperty("declAgreement", false);
  });

  it("passports array is seeded with one empty item", () => {
    const defaults = buildDefaultValues(testConfig);
    expect(Array.isArray(defaults.passports)).toBe(true);
    const passports = defaults.passports as Record<string, unknown>[];
    expect(passports).toHaveLength(1);
    expect(passports[0]).toMatchObject({
      passportNo: "",
      passportPersonalNo: "",
      passportNationality: "",
      passportIssuingAuthority: "",
    });
  });

  it("buildSchemaFromConfig produces a valid zod schema", () => {
    const schema = buildSchemaFromConfig(testConfig);
    expect(schema).toBeDefined();
    // A minimal valid partial submission (non-required fields will be ""/"undefined")
    const result = schema.safeParse({ workPermitRef: "WP-001" });
    // Partial parse — just check it runs without throwing
    expect(result).toHaveProperty("success");
  });

  it("tinNumber rejects non-12-digit values", () => {
    const schema = buildSchemaFromConfig(testConfig);
    const result = schema.safeParse({
      workPermitRef: "WP-001",
      tinNumber: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const tinError = result.error.issues.find((i) =>
        i.path.includes("tinNumber"),
      );
      expect(tinError).toBeDefined();
    }
  });

  it("tinNumber accepts exactly 12 digits", () => {
    const schema = buildSchemaFromConfig(testConfig);
    // All other required fields missing — only check tinNumber has no error
    const result = schema.safeParse({
      workPermitRef: "WP-001",
      tinNumber: "123456789012",
    });
    if (!result.success) {
      const tinError = result.error.issues.find((i) =>
        i.path.includes("tinNumber"),
      );
      expect(tinError).toBeUndefined();
    }
  });
});
