import { FormEngine } from "@/form-engine";
import { renderWithProviders } from "@/test/utils";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { conditionalFormConfig } from "./conditionalFormConfig";

function setup() {
  const onSubmit = vi.fn();
  const { user } = renderWithProviders(
    <FormEngine config={conditionalFormConfig} onSubmit={onSubmit} />,
  );
  return { user, onSubmit };
}

describe("ConditionalForm", () => {
  it("renders the location block fields", () => {
    setup();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /country/i }),
    ).toBeInTheDocument();
  });

  it("insurance details block is hidden by default", () => {
    setup();
    expect(screen.queryByText("Insurance Details")).not.toBeInTheDocument();
  });

  it("shows insurance details block when hasInsurance is checked", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("checkbox", { name: /i have health insurance/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Insurance Details")).toBeInTheDocument();
    });
  });

  it("hides insurance details block when hasInsurance is unchecked again", async () => {
    const { user } = setup();

    const checkbox = screen.getByRole("checkbox", {
      name: /i have health insurance/i,
    });
    await user.click(checkbox);
    await waitFor(() =>
      expect(screen.getByText("Insurance Details")).toBeInTheDocument(),
    );

    await user.click(checkbox);
    await waitFor(() => {
      expect(screen.queryByText("Insurance Details")).not.toBeInTheDocument();
    });
  });

  it("district select is disabled when no country selected", () => {
    setup();
    // The select trigger for District should be disabled
    const districtTrigger = screen.getByRole("combobox", { name: /district/i });
    expect(districtTrigger).toBeDisabled();
  });

  it("upazila select is disabled when no district is selected", () => {
    setup();
    const upazilaSelect = screen.getByRole("combobox", { name: /upazila/i });
    expect(upazilaSelect).toBeDisabled();
  });

  it("shows validation error when submitted without country", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText("Country is required")).toBeInTheDocument();
    });
  });
});
