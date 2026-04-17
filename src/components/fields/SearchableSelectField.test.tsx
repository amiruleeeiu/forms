import { Form } from "@/components/ui/form";
import { renderWithProviders } from "@/test/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { SearchableSelectField } from "./SearchableSelectField";

const CITIES = [
  { label: "New York", value: "new-york" },
  { label: "Los Angeles", value: "los-angeles" },
  { label: "Chicago", value: "chicago" },
];

const schema = z.object({
  city: z.string().min(1, "City is required"),
});
type FormValues = z.infer<typeof schema>;

function Wrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { city: "" },
    mode: "onTouched",
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SearchableSelectField
          control={form.control}
          name="city"
          label="City"
          placeholder="Search cities..."
          options={CITIES}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("SearchableSelectField", () => {
  it("renders the label", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("City")).toBeInTheDocument();
  });

  it("renders the placeholder when no option selected", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("Search cities...")).toBeInTheDocument();
  });

  it("renders the required asterisk", () => {
    renderWithProviders(<Wrapper />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows validation error when submitted empty", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(/city is required/i);
  });

  it("opens the dropdown when clicked", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByText("Search cities..."));
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
    });
  });

  it("filters options based on search input", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByText("Search cities..."));
    await waitFor(() => screen.getByPlaceholderText("Search…"));
    await user.type(screen.getByPlaceholderText("Search…"), "new");
    await waitFor(() => {
      expect(screen.getByText("New York")).toBeInTheDocument();
      expect(screen.queryByText("Los Angeles")).not.toBeInTheDocument();
    });
  });

  it("selects an option and closes the dropdown", async () => {
    const { user } = renderWithProviders(<Wrapper />);
    await user.click(screen.getByText("Search cities..."));
    await waitFor(() => screen.getByText("Chicago"));
    await user.click(screen.getByText("Chicago"));
    await waitFor(() => {
      // Dropdown should close and the trigger should show selected label
      expect(screen.queryByPlaceholderText("Search…")).not.toBeInTheDocument();
      expect(screen.getByText("Chicago")).toBeInTheDocument();
    });
  });

  it("calls onSubmit with the selected city value", async () => {
    const handleSubmit = vi.fn();
    const { user } = renderWithProviders(<Wrapper onSubmit={handleSubmit} />);
    await user.click(screen.getByText("Search cities..."));
    await waitFor(() => screen.getByText("New York"));
    await user.click(screen.getByText("New York"));
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { city: "new-york" },
        expect.anything(),
      );
    });
  });
});
