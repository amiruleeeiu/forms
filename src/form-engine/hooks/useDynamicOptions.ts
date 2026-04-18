import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import type { OptionsConfig, SelectOption } from "../types";

export type DynamicOptionsResult = {
  options: SelectOption[];
  loading: boolean;
  error: Error | null;
};

/**
 * Resolves options from a static list or an async API fetcher.
 *
 * - Static: returns items synchronously with no loading state.
 * - API: calls `config.fetcher` on mount and whenever the `dependsOn` field
 *   value changes. A cancelled flag prevents state updates after unmount.
 *
 * Must be called inside a react-hook-form FormProvider (uses useWatch).
 */
export function useDynamicOptions(
  config: OptionsConfig | undefined,
): DynamicOptionsResult {
  const dependsOnName =
    config?.type === "api"
      ? (config.dependsOn ?? "__engine_no_dep__")
      : "__engine_no_dep__";

  // Always call useWatch with a stable name; returns undefined for unknown fields.
  const watchedValue = useWatch({ name: dependsOnName as never });

  const [options, setOptions] = useState<SelectOption[]>(() =>
    config?.type === "static" ? config.items : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!config || config.type !== "api") return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params =
      config.dependsOn && watchedValue != null
        ? { [config.dependsOn]: String(watchedValue) }
        : undefined;

    config
      .fetcher(params)
      .then((items) => {
        if (!cancelled) {
          setOptions(items);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValue, config?.type]);

  return { options, loading, error };
}
