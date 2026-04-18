import { renderHook } from "@testing-library/react";
import { type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { useCondition } from "../hooks/useCondition";

function makeWrapper(defaultValues: Record<string, unknown>) {
  function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm({ defaultValues });
    return <FormProvider {...form}>{children}</FormProvider>;
  }
  return Wrapper;
}

describe("useCondition", () => {
  it("returns true when no expression is given", () => {
    const { result } = renderHook(() => useCondition(undefined), {
      wrapper: makeWrapper({}),
    });
    expect(result.current).toBe(true);
  });

  it("returns true when a leaf condition is satisfied", () => {
    const { result } = renderHook(
      () => useCondition({ field: "country", operator: "eq", value: "bd" }),
      { wrapper: makeWrapper({ country: "bd" }) },
    );
    expect(result.current).toBe(true);
  });

  it("returns false when a leaf condition is not satisfied", () => {
    const { result } = renderHook(
      () => useCondition({ field: "country", operator: "eq", value: "bd" }),
      { wrapper: makeWrapper({ country: "us" }) },
    );
    expect(result.current).toBe(false);
  });

  it("returns true for truthy operator on a set value", () => {
    const { result } = renderHook(
      () => useCondition({ field: "hasInsurance", operator: "truthy" }),
      { wrapper: makeWrapper({ hasInsurance: true }) },
    );
    expect(result.current).toBe(true);
  });

  it("returns false for truthy operator on falsy value", () => {
    const { result } = renderHook(
      () => useCondition({ field: "hasInsurance", operator: "truthy" }),
      { wrapper: makeWrapper({ hasInsurance: false }) },
    );
    expect(result.current).toBe(false);
  });

  it("evaluates and node", () => {
    const wrapper = makeWrapper({ country: "bd", active: true });
    const { result } = renderHook(
      () =>
        useCondition({
          and: [
            { field: "country", operator: "eq", value: "bd" },
            { field: "active", operator: "truthy" },
          ],
        }),
      { wrapper },
    );
    expect(result.current).toBe(true);
  });

  it("evaluates or node — one branch true", () => {
    const wrapper = makeWrapper({ country: "us" });
    const { result } = renderHook(
      () =>
        useCondition({
          or: [
            { field: "country", operator: "eq", value: "bd" },
            { field: "country", operator: "eq", value: "us" },
          ],
        }),
      { wrapper },
    );
    expect(result.current).toBe(true);
  });

  it("evaluates or node — all branches false", () => {
    const wrapper = makeWrapper({ country: "fr" });
    const { result } = renderHook(
      () =>
        useCondition({
          or: [
            { field: "country", operator: "eq", value: "bd" },
            { field: "country", operator: "eq", value: "us" },
          ],
        }),
      { wrapper },
    );
    expect(result.current).toBe(false);
  });
});
