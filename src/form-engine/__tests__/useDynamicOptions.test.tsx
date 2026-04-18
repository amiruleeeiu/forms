import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { useDynamicOptions } from "../hooks/useDynamicOptions";
import type { SelectOption } from "../types";

const OPTIONS: SelectOption[] = [
  { label: "Bangladesh", value: "bd" },
  { label: "India", value: "in" },
];

function makeWrapper(defaultValues: Record<string, unknown> = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm({ defaultValues });
    return <FormProvider {...form}>{children}</FormProvider>;
  }
  return Wrapper;
}

describe("useDynamicOptions — static", () => {
  it("returns items immediately with no loading", () => {
    const { result } = renderHook(
      () => useDynamicOptions({ type: "static", items: OPTIONS }),
      { wrapper: makeWrapper() },
    );
    expect(result.current.options).toEqual(OPTIONS);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe("useDynamicOptions — undefined config", () => {
  it("returns empty options with no loading", () => {
    const { result } = renderHook(() => useDynamicOptions(undefined), {
      wrapper: makeWrapper(),
    });
    expect(result.current.options).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});

describe("useDynamicOptions — api", () => {
  it("calls fetcher on mount and returns options", async () => {
    const fetcher = vi.fn().mockResolvedValue(OPTIONS);

    const { result } = renderHook(
      () => useDynamicOptions({ type: "api", fetcher }),
      { wrapper: makeWrapper() },
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.options).toEqual(OPTIONS);
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(undefined);
  });

  it("forwards dependsOn value to fetcher as param", async () => {
    const districtOptions: SelectOption[] = [
      { label: "Dhaka", value: "dhaka" },
    ];
    const fetcher = vi.fn().mockResolvedValue(districtOptions);

    const { result } = renderHook(
      () => useDynamicOptions({ type: "api", fetcher, dependsOn: "country" }),
      { wrapper: makeWrapper({ country: "bd" }) },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetcher).toHaveBeenCalledWith({ country: "bd" });
    expect(result.current.options).toEqual(districtOptions);
  });

  it("sets error state on fetcher rejection", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(
      () => useDynamicOptions({ type: "api", fetcher }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe("Network error");
    expect(result.current.options).toEqual([]);
  });
});
