import { Form } from "@/components/ui/form";
import { renderWithProviders } from "@/test/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { CheckboxField } from "./CheckboxField";

const schema = z.object({
  acceptTerms: z.literal(true, "You must accept the terms"),
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
        <CheckboxField
          name="acceptTerms"
          label="I accept the terms and conditions"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("CheckboxField", () => {
  it("renders the label", () => {
    renderWithProviders(<Wrapper />);
    expect(
      screen.getByText("I accept the terms and conditions"),
    ).toBeInTheDocument();
  });

  it("renders an unchecked checkbox initially", () => {
    renderWithProviders(<Wrapper />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("toggles to checked when clicked", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it("toggles back to unchecked when clicked again", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });

  it("shows error when submitted unchecked", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(/must accept the terms/i);
  });

  it("clears error after checking", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await screen.findByRole("alert");
    await user.click(screen.getByRole("checkbox"));
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("calls onSubmit when checkbox is checked and form submitted", async () => {
    const handleSubmit = vi.fn();
    const { user } = renderWithProviders(<Wrapper onSubmit={handleSubmit} />);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { acceptTerms: true },
        expect.anything(),
      );
    });
  });
});
