import type { FieldConfig, StepConfig } from "../types";
import { evaluateCondition } from "./evaluateCondition";

type FieldError = { name: string; message: string };

function isEmpty(value: unknown, field: FieldConfig): boolean {
  if (field.type === "checkbox") return value === false;
  if (field.type === "checkbox-group")
    return !Array.isArray(value) || value.length === 0;
  if (field.type === "file") return value === null || value === undefined;
  if (field.type === "number" || field.type === "date")
    return value === undefined || value === null;
  return value === "" || value === null || value === undefined;
}

/**
 * Returns a list of visible required fields that have empty values.
 * Used by StepFormEngine.handleNext to manually enforce required validation
 * on fields that are marked optional in the Zod schema because they live
 * inside conditional blocks (makeConditionalOptional).
 */
export function getVisibleRequiredErrors(
  step: StepConfig,
  values: Record<string, unknown>,
): FieldError[] {
  const errors: FieldError[] = [];
  const seen = new Set<string>();

  for (const block of step.blocks) {
    // Block-level visibility
    if (block.showWhen && !evaluateCondition(block.showWhen, values)) continue;
    if (block.hideWhen && evaluateCondition(block.hideWhen, values)) continue;

    // Repeatable blocks are validated by Zod (array schema, not optional-ized)
    if (block.repeatable) continue;

    for (const field of block.fields) {
      if (seen.has(field.name)) continue;
      seen.add(field.name);

      // Field-level visibility
      if (field.hide) continue;
      if (field.showWhen && !evaluateCondition(field.showWhen, values))
        continue;
      if (field.hideWhen && evaluateCondition(field.hideWhen, values)) continue;

      // Not required → skip
      if (field.required === false) continue;

      const value = values[field.name];
      if (isEmpty(value, field)) {
        errors.push({
          name: field.name,
          message:
            field.validation?.messages?.required ?? "This field is required",
        });
      }
    }
  }

  return errors;
}
