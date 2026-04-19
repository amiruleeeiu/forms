import type { StepFormConfig } from "../types";

/**
 * Inverse of groupValuesByConfig — takes a possibly nested payload
 * (as stored in the DB after grouping) and flattens it back to the flat
 * field-name map that react-hook-form expects as `defaultValues`.
 *
 * Rules:
 * - Arrays are kept as-is (repeatable blocks like `passports`)
 * - Objects that have a `url` key are kept as-is (uploaded file references)
 * - All other plain objects are recursed and their children merged flat
 */
export function flattenGroupedValues(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function walk(node: Record<string, unknown>) {
    for (const [key, value] of Object.entries(node)) {
      const isPlainObject =
        value !== null && typeof value === "object" && !Array.isArray(value);

      // number-unit compound value — keep { amount, unit } as a leaf
      const isNumberUnit =
        isPlainObject &&
        Object.keys(value as object).length === 2 &&
        "amount" in (value as object) &&
        "unit" in (value as object);

      if (isPlainObject && !("url" in (value as object)) && !isNumberUnit) {
        // Nested group — recurse into it
        walk(value as Record<string, unknown>);
      } else {
        // Leaf: primitive, null, array, or uploaded-file reference {url, originalName}
        result[key] = value;
      }
    }
  }

  walk(data);
  return result;
}

/**
 * Groups flat form values into a nested object based on the `dataKey` property
 * defined on each step and block in the config.
 *
 * - If a step has `dataKey`, its fields are placed under `result[step.dataKey]`.
 * - If a block has `dataKey`, its fields are nested under that key within the
 *   step's object. Multiple blocks sharing the same `dataKey` are merged.
 * - Steps and blocks without a `dataKey` are merged flat into their parent.
 *
 * @example
 * // Step with dataKey "bankInfo", blocks without dataKey:
 * // values: { accountHolderName: "Alice", bankName: "XYZ", bankStatement: File }
 * // result: { bankInfo: { accountHolderName: "Alice", bankName: "XYZ", bankStatement: File } }
 */
export function groupValuesByConfig(
  config: StepFormConfig,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const step of config.steps) {
    const stepData: Record<string, unknown> = {};

    for (const block of step.blocks) {
      // Repeatable block: the array lives at values[arrayName] directly.
      if (block.repeatable) {
        const { arrayName } = block.repeatable;
        if (Object.prototype.hasOwnProperty.call(values, arrayName)) {
          if (block.dataKey) {
            stepData[block.dataKey] = values[arrayName];
          } else {
            stepData[arrayName] = values[arrayName];
          }
        }
        continue;
      }

      const blockData: Record<string, unknown> = {};

      for (const field of block.fields) {
        if (Object.prototype.hasOwnProperty.call(values, field.name)) {
          blockData[field.name] = values[field.name];
        }
      }

      if (block.dataKey) {
        const existing = stepData[block.dataKey];
        stepData[block.dataKey] =
          existing !== null && typeof existing === "object"
            ? { ...(existing as Record<string, unknown>), ...blockData }
            : blockData;
      } else {
        Object.assign(stepData, blockData);
      }
    }

    if (step.dataKey) {
      result[step.dataKey] = stepData;
    } else {
      Object.assign(result, stepData);
    }
  }

  return result;
}
