import { Form } from "@/components/ui/form";
import { renderWithProviders } from "@/test/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { SelectField } from "./SelectField";

const COUNTRIES = [
  { label: "United States", value: "us" },
  { label: "Canada", value: "ca" },
  { label: "Mexico", value: "mx" },
];

const schema = z.object({
  country: z.string().min(1, "Country is required"),
});
type FormValues = z.infer<typeof schema>;

function Wrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: "" },
    mode: "onTouched",
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectField
          name="country"
          label="Country"
          placeholder="Select a country"
          options={COUNTRIES}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("SelectField", () => {
  it("renders the label", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Country")).toBeInTheDocument();
  });

  it("renders placeholder by default", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Select a country")).toBeInTheDocument();
  });

  it("renders the required asterisk", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows validation error when submitted empty", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(/country is required/i);
  });

  it("opens the dropdown on click", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.getByText("United States")).toBeInTheDocument();
    });
  });

  it("selects an option and updates the value", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("combobox"));
    await waitFor(() => screen.getByText("Canada"));
    await user.click(screen.getByText("Canada"));
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveTextContent("Canada");
    });
  });

  it("clears the error after selecting a valid option", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    // Trigger error
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await screen.findByRole("alert");
    // Select a value
    await user.click(screen.getByRole("combobox"));
    await waitFor(() => screen.getByText("Mexico"));
    await user.click(screen.getByText("Mexico"));
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("calls onSubmit with the selected value", async () => {
    const handleSubmit = vi.fn();
    const { user } = renderWithProviders(<Wrapper onSubmit={handleSubmit} />);
    await user.click(screen.getByRole("combobox"));
    await waitFor(() => screen.getByText("United States"));
    await user.click(screen.getByText("United States"));
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { country: "us" },
        expect.anything(),
      );
    });
  });
});
