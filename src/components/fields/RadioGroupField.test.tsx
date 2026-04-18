import { Form } from "@/components/ui/form";
import { renderWithProviders } from "@/test/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { RadioGroupField } from "./RadioGroupField";

const GENDERS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const schema = z.object({
  gender: z.enum(["male", "female", "other"], {
    error: "Please select a gender",
  }),
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
        <RadioGroupField
          name="gender"
          label="Gender"
          options={GENDERS}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("RadioGroupField", () => {
  it("renders the group label", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Gender")).toBeInTheDocument();
  });

  it("renders all option labels", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("renders radio buttons for each option", () => {
    renderWithProviders(<Wrapper />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("starts with no radio selected", () => {
    renderWithProviders(<Wrapper />);
    screen.getAllByRole("radio").forEach((r) => expect(r).not.toBeChecked());
  });

  it("selects a radio option when clicked", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("radio", { name: "Male" }));
    expect(screen.getByRole("radio", { name: "Male" })).toBeChecked();
  });

  it("only one radio can be selected at a time", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("radio", { name: "Male" }));
    await user.click(screen.getByRole("radio", { name: "Female" }));
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "Female" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Male" })).not.toBeChecked();
      expect(screen.getByRole("radio", { name: "Other" })).not.toBeChecked();
    });
  });

  it("shows validation error when submitted without selection", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(/select a gender/i);
  });

  it("clears validation error after selecting an option", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await screen.findByRole("alert");
    await user.click(screen.getByRole("radio", { name: "Other" }));
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("calls onSubmit with the selected value", async () => {
    const handleSubmit = vi.fn();
    const { user } = renderWithProviders(<Wrapper onSubmit={handleSubmit} />);
    await user.click(screen.getByRole("radio", { name: "Female" }));
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { gender: "female" },
        expect.anything(),
      );
    });
  });
});
