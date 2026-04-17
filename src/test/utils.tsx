import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactElement } from "react";

function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  const user = userEvent.setup();
  return {
    user,
    ...render(ui, options),
  };
}

export * from "@testing-library/react";
export { renderWithProviders, userEvent };
