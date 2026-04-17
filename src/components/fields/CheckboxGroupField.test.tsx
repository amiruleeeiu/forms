import { Form } from "@/components/ui/form";
import { renderWithProviders } from "@/test/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { CheckboxGroupField } from "./CheckboxGroupField";

const SKILLS = [
  { label: "JavaScript", value: "js" },
  { label: "TypeScript", value: "ts" },
  { label: "React", value: "react" },
];

const schema = z.object({
  skills: z.array(z.string()).min(1, "Select at least one skill"),
});
type FormValues = z.infer<typeof schema>;

function Wrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { skills: [] },
    mode: "onTouched",
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CheckboxGroupField
          control={form.control}
          name="skills"
          label="Skills"
          options={SKILLS}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("CheckboxGroupField", () => {
  it("renders the group label", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });

  it("renders all option labels", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders all checkboxes unchecked initially", () => {
    renderWithProviders(<Wrapper />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
  });

  it("checks a checkbox when clicked", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("checkbox", { name: "JavaScript" }));
    expect(screen.getByRole("checkbox", { name: "JavaScript" })).toBeChecked();
  });

  it("unchecks when clicked again", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("checkbox", { name: "React" }));
    await waitFor(() =>
      expect(screen.getByRole("checkbox", { name: "React" })).toBeChecked(),
    );
    await user.click(screen.getByRole("checkbox", { name: "React" }));
    await waitFor(() =>
      expect(screen.getByRole("checkbox", { name: "React" })).not.toBeChecked(),
    );
  });

  it("allows multiple selections", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("checkbox", { name: "JavaScript" }));
    await user.click(screen.getByRole("checkbox", { name: "TypeScript" }));
    expect(screen.getByRole("checkbox", { name: "JavaScript" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "TypeScript" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "React" })).not.toBeChecked();
  });

  it("shows validation error when nothing selected on submit", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(/at least one skill/i);
  });

  it("clears error after selecting at least one option", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await screen.findByRole("alert");
    await user.click(screen.getByRole("checkbox", { name: "React" }));
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("calls onSubmit with an array of selected values", async () => {
    const handleSubmit = vi.fn();
    const { user } = renderWithProviders(<Wrapper onSubmit={handleSubmit} />);
    await user.click(screen.getByRole("checkbox", { name: "JavaScript" }));
    await user.click(screen.getByRole("checkbox", { name: "React" }));
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { skills: ["js", "react"] },
        expect.anything(),
      );
    });
  });
});
