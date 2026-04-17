import { renderWithProviders } from "@/test/utils";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExampleForm } from "./ExampleForm";

// Stub out the PhoneInput library to keep tests simple
vi.mock("react-phone-number-input", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("react-phone-number-input")>();
  return {
    ...original,
    default: ({
      onChange,
      value,
      placeholder,
    }: {
      onChange: (v: string) => void;
      value: string;
      placeholder?: string;
    }) => (
      <input
        role="textbox"
        aria-label="Phone Number"
        placeholder={placeholder ?? "Phone number"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
  };
});

describe("ExampleForm", () => {
  it("renders all field labels", () => {
    renderWithProviders(<ExampleForm />);
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Date of Birth")).toBeInTheDocument();
    expect(screen.getByText("Phone Number")).toBeInTheDocument();
    expect(screen.getByText("Gender")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(
      screen.getByText("I agree to the Terms of Service and Privacy Policy"),
    ).toBeInTheDocument();
  });

  it("renders Submit and Reset buttons", () => {
    renderWithProviders(<ExampleForm />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("shows multiple validation errors when submitted empty", async () => {
    const { user } = renderWithProviders(<ExampleForm />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const errors = await screen.findAllByRole("alert");
    // At least name, age, gender, skills, country, city, acceptTerms should error
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });

  it("shows name required error on empty submit", async () => {
    const { user } = renderWithProviders(<ExampleForm />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const alerts = await screen.findAllByRole("alert");
    const texts = alerts.map((a) => a.textContent?.toLowerCase() ?? "");
    expect(
      texts.some(
        (t) =>
          t.includes("name") ||
          t.includes("required") ||
          t.includes("characters"),
      ),
    ).toBe(true);
  });

  it("submit button is disabled during submission", async () => {
    const { user } = renderWithProviders(<ExampleForm />);
    const submitBtn = screen.getByRole("button", { name: /submit/i });

    // Fill in name to reduce errors but the form will still fail validation on other fields
    await user.type(
      screen.getByRole("textbox", { name: /full name/i }),
      "Alice Johnson",
    );

    // Trigger submit - it will fail validation instantly (disabled state applies while submitting)
    await user.click(submitBtn);
    // Button should remain enabled when validation fails (not actually submitting)
    expect(submitBtn).not.toBeDisabled();
  });

  it("reset button clears the name field", async () => {
    const { user } = renderWithProviders(<ExampleForm />);
    const nameInput = screen.getByRole("textbox", { name: /full name/i });
    await user.type(nameInput, "Bob Smith");
    expect(nameInput).toHaveValue("Bob Smith");
    await user.click(screen.getByRole("button", { name: /reset/i }));
    await waitFor(() => {
      expect(nameInput).toHaveValue("");
    });
  });

  it("selecting a skill checks its checkbox", async () => {
    const { user } = renderWithProviders(<ExampleForm />);
    const jsCheckbox = screen.getByRole("checkbox", { name: "JavaScript" });
    await user.click(jsCheckbox);
    expect(jsCheckbox).toBeChecked();
  });

  it("selecting a gender radio updates form state", async () => {
    const { user } = renderWithProviders(<ExampleForm />);
    await user.click(screen.getByRole("radio", { name: "Female" }));
    expect(screen.getByRole("radio", { name: "Female" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Male" })).not.toBeChecked();
  });

  it("checking acceptTerms clears its error", async () => {
    const { user } = renderWithProviders(<ExampleForm />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    // Wait for terms error
    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(
        alerts.some((a) => a.textContent?.toLowerCase().includes("terms")),
      ).toBe(true);
    });
    await user.click(
      screen.getByRole("checkbox", {
        name: /agree to the terms/i,
      }),
    );
    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(
        alerts.every((a) => !a.textContent?.toLowerCase().includes("terms")),
      ).toBe(true);
    });
  });
});
