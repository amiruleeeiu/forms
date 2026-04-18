import type { StepConfig } from "../types";

/**
 * Extracts all field `name` values from a step's blocks.
 * Used by StepFormEngine to run partial validation via form.trigger(fieldNames).
 */
export function getStepFieldNames(step: StepConfig): string[] {
  return step.blocks.flatMap((block) =>
    block.fields.map((field) => field.name),
  );
}
