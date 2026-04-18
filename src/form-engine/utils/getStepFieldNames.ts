import type { StepConfig } from "../types";

/**
 * Extracts all field `name` values from a step's blocks.
 * Used by StepFormEngine to run partial validation via form.trigger(fieldNames).
 * For repeatable blocks, returns the array name instead of individual field names.
 */
export function getStepFieldNames(step: StepConfig): string[] {
  return step.blocks.flatMap((block) => {
    if (block.repeatable) return [block.repeatable.arrayName];
    return block.fields.map((field) => field.name);
  });
}
