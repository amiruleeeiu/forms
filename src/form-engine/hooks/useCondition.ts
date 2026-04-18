import { useWatch } from "react-hook-form";
import type { ConditionExpr } from "../types";
import { evaluateCondition } from "../utils/evaluateCondition";

/**
 * Subscribes to all form values via useWatch and evaluates the given condition
 * expression.
 *
 * @param expr - The condition to evaluate. Pass `undefined` to use `defaultResult`.
 * @param defaultResult - Returned when `expr` is undefined.
 *   - Use `true`  for showWhen  ("show by default")
 *   - Use `false` for hideWhen  ("don't hide by default")
 *   - Use `false` for disableWhen ("don't disable by default")
 *
 * Must be called inside a react-hook-form FormProvider.
 */
export function useCondition(
  expr: ConditionExpr | undefined,
  defaultResult = true,
): boolean {
  const values = useWatch() as Record<string, unknown>;
  if (!expr) return defaultResult;
  return evaluateCondition(expr, values);
}
