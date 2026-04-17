import { Form } from "@/components/ui/form";
import { renderWithProviders } from "@/test/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { DatePickerField } from "./DatePickerField";

const schema = z.object({
  dob: z.date({ error: "Date of birth is required" }),
});
type FormValues = z.infer<typeof schema>;

function Wrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DatePickerField
          control={form.control}
          name="dob"
          label="Date of Birth"
          placeholder="Pick a date"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("DatePickerField", () => {
  it("renders the label", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Date of Birth")).toBeInTheDocument();
  });

  it("renders the placeholder when no date selected", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
  });

  it("renders the required asterisk", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows validation error when submitted without a date", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(/date of birth is required/i);
  });

  it("opens the calendar popover when trigger is clicked", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    const trigger = screen.getByText("Pick a date");
    await user.click(trigger);
    // Calendar grid should appear
    await waitFor(() => {
      // react-day-picker renders a grid role
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });

  it("closes the calendar when a date is selected", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByText("Pick a date"));
    await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());
    // Click the first available (not disabled) day button
    const dayButtons = screen
      .getAllByRole("button")
      .filter(
        (btn) =>
          !btn.getAttribute("disabled") && btn.closest("[role=grid]") !== null,
      );
    if (dayButtons.length > 0) {
      await user.click(dayButtons[0]);
      await waitFor(() => {
        expect(screen.queryByRole("grid")).not.toBeInTheDocument();
      });
    }
  });
});
