import { useEffect, useReducer } from "react";
import { useWatch } from "react-hook-form";
import type { OptionsConfig, SelectOption } from "../types";

export type DynamicOptionsResult = {
  options: SelectOption[];
  loading: boolean;
  error: Error | null;
};

type State = { options: SelectOption[]; loading: boolean; error: Error | null };
type Action =
  | { type: "start" }
  | { type: "success"; items: SelectOption[] }
  | { type: "error"; error: Error };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { options: state.options, loading: true, error: null };
    case "success":
      return { options: action.items, loading: false, error: null };
    case "error":
      return { options: state.options, loading: false, error: action.error };
  }
}

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

  const [state, dispatch] = useReducer(reducer, {
    options: config?.type === "static" ? config.items : [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!config || config.type !== "api") return;

    let cancelled = false;
    dispatch({ type: "start" });

    const params =
      config.dependsOn && watchedValue != null
        ? { [config.dependsOn]: String(watchedValue) }
        : undefined;

    // Resolve the actual fetch call: function-based takes precedence, then URL-based.
    const resolve: Promise<SelectOption[]> = config.fetcher
      ? config.fetcher(params)
      : config.url
        ? (async () => {
            const depValue =
              config.dependsOn && params ? params[config.dependsOn] : undefined;
            // If a dependsOn is configured but the value is not yet available,
            // return an empty list (same behaviour as the old inline fetchers).
            if (config.dependsOn && !depValue) return [];

            let url = config.url!;
            if (config.paramName && depValue) {
              const qs = new URLSearchParams({
                [config.paramName]: depValue,
              }).toString();
              url = `${url}?${qs}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res.json() as Promise<SelectOption[]>;
          })()
        : Promise.resolve([]);

    resolve
      .then((items) => {
        if (!cancelled) dispatch({ type: "success", items });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          dispatch({
            type: "error",
            error: err instanceof Error ? err : new Error(String(err)),
          });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValue, config?.type]);

  return state;
}
