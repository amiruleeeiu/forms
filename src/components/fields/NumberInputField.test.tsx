import { Form } from "@/components/ui/form";
import { renderWithProviders } from "@/test/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { NumberInputField } from "./NumberInputField";

const schema = z.object({
  age: z
    .number({ error: "Age must be a number" })
    .min(1, "Min age is 1")
    .max(120, "Max age is 120"),
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
        <NumberInputField
          name="age"
          label="Age"
          placeholder="Enter age"
          required
          min={1}
          max={120}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("NumberInputField", () => {
  it("renders label and placeholder", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter age")).toBeInTheDocument();
  });

  it("renders as a spinbutton (number input role)", () => {
    renderWithProviders(<Wrapper />);
    expect(
      screen.getByRole("spinbutton", { name: /age/i }),
    ).toBeInTheDocument();
  });

  it("accepts a valid number", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    const input = screen.getByRole("spinbutton");
    await user.type(input, "25");
    expect(input).toHaveValue(25);
  });

  it("shows error when below min on submit", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    const input = screen.getByRole("spinbutton");
    await user.type(input, "0");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/min age is 1/i);
    });
  });

  it("shows error when above max on submit", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    const input = screen.getByRole("spinbutton");
    await user.type(input, "150");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/max age is 120/i);
    });
  });

  it("shows error when empty on submit", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("calls onSubmit with correct numeric value", async () => {
    const handleSubmit = vi.fn();
    const { user } = renderWithProviders(<Wrapper onSubmit={handleSubmit} />);
    await user.type(screen.getByRole("spinbutton"), "30");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ age: 30 }, expect.anything());
    });
  });
});
