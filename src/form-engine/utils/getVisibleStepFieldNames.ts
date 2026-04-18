import type { StepConfig } from "../types";
import { evaluateCondition } from "./evaluateCondition";

/**
 * Returns field names for the visible blocks/fields of a step, evaluated
 * against the current form values. Hidden conditional blocks and fields are
 * excluded so form.trigger() only validates what the user can actually see.
 * For repeatable blocks, returns the array name if the block is visible.
 */
export function getVisibleStepFieldNames(
  step: StepConfig,
  values: Record<string, unknown>,
): string[] {
  const names: string[] = [];

  for (const block of step.blocks) {
    // Block-level visibility
    if (block.showWhen && !evaluateCondition(block.showWhen, values)) continue;
    if (block.hideWhen && evaluateCondition(block.hideWhen, values)) continue;

    // Repeatable block: just push the array name
    if (block.repeatable) {
      names.push(block.repeatable.arrayName);
      continue;
    }

    for (const field of block.fields) {
      // Field-level visibility
      if (field.hide) continue;
      if (field.showWhen && !evaluateCondition(field.showWhen, values))
        continue;
      if (field.hideWhen && evaluateCondition(field.hideWhen, values)) continue;

      names.push(field.name);
    }
  }

  // Deduplicate — shared field arrays (e.g. STANDARD_LOCAL_ADDRESS_FIELDS)
  // appear in multiple blocks; only one block is visible at a time.
  return [...new Set(names)];
}
