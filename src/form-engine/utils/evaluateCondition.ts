import type { ConditionExpr, ConditionLeaf, ConditionNode } from "../types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolves a dot-path string against a plain object.
 * e.g. getValueByPath({ a: { b: 1 } }, "a.b") → 1
 */
export function getValueByPath(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc != null ? (acc as Record<string, unknown>)[key] : undefined,
      obj,
    );
}

function isLeaf(expr: ConditionExpr): expr is ConditionLeaf {
  return "field" in expr;
}

function evaluateRule(
  leaf: ConditionLeaf,
  values: Record<string, unknown>,
): boolean {
  const actual = getValueByPath(values, leaf.field);
  switch (leaf.operator) {
    case "eq":
      return actual === leaf.value;
    case "neq":
      return actual !== leaf.value;
    case "in":
      return Array.isArray(leaf.value) && leaf.value.includes(actual);
    case "not_in":
      return Array.isArray(leaf.value) && !leaf.value.includes(actual);
    case "truthy":
      return !!actual;
    case "falsy":
      return !actual;
    default:
      return true;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Recursively evaluate a condition expression against a flat/nested values map.
 * Returns `true` when the condition is satisfied.
 */
export function evaluateCondition(
  expr: ConditionExpr,
  values: Record<string, unknown>,
): boolean {
  if (isLeaf(expr)) return evaluateRule(expr, values);

  const node = expr as ConditionNode;
  if (node.and) return node.and.every((c) => evaluateCondition(c, values));
  if (node.or) return node.or.some((c) => evaluateCondition(c, values));

  return true;
}
