import { Form } from "@/components/ui/form";
import { renderWithProviders } from "@/test/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { PhoneInputField } from "./PhoneInputField";

const schema = z.object({
  phone: z
    .string()
    .min(1, "Phone is required")
    .refine(isValidPhoneNumber, "Invalid phone number"),
});
type FormValues = z.infer<typeof schema>;

function Wrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "" },
    mode: "onTouched",
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PhoneInputField
          control={form.control}
          name="phone"
          label="Phone Number"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("PhoneInputField", () => {
  it("renders the label", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Phone Number")).toBeInTheDocument();
  });

  it("renders the required asterisk", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders a phone text input", () => {
    renderWithProviders(<Wrapper />);
    // react-phone-number-input renders a telephone input
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("renders a country selector button", () => {
    renderWithProviders(<Wrapper />);
    // The flag/country button
    const countryBtn = screen.getByRole("combobox");
    expect(countryBtn).toBeInTheDocument();
  });

  it("shows required error on empty submit", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const error = await screen.findByRole("alert");
    expect(error).toBeInTheDocument();
  });

  it("shows invalid format error for partial number", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    const input = screen.getByRole("textbox");
    await user.type(input, "123");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(/invalid phone number/i);
  });

  it("calls onSubmit with a valid US phone number", async () => {
    const handleSubmit = vi.fn();
    const { user } = renderWithProviders(<Wrapper onSubmit={handleSubmit} />);
    const input = screen.getByRole("textbox");
    // Type a valid US number (react-phone-number-input tracks as E.164: +12015551234)
    await user.type(input, "2015551234");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
