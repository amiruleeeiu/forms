import type { FieldConfig, StepConfig } from "../types";

/**
 * Returns a sample value for a single field.
 * Uses `devSampleValue` from the config if provided; otherwise auto-generates
 * a sensible value based on the field type.
 */
function fieldSampleValue(field: FieldConfig): unknown {
  if (field.devSampleValue !== undefined) return field.devSampleValue;

  switch (field.type) {
    case "checkbox":
      return true;

    case "checkbox-group":
      if (field.options?.type === "static" && field.options.items.length > 0) {
        return [field.options.items[0].value];
      }
      return [];

    case "select":
    case "radio-group":
    case "searchable-select":
      if (field.options?.type === "static" && field.options.items.length > 0) {
        return String(field.options.items[0].value);
      }
      return "";

    case "email":
      return "test@example.com";

    case "phone":
      return "+8801711223344";

    case "number":
      return field.min ?? 1;

    case "date":
      return new Date();

    case "url":
      return "https://example.com";

    case "file":
      // Cannot fake a real File object in a form — skip
      return null;

    default:
      // text, password, tel, textarea, etc.
      return field.placeholder ?? "Sample";
  }
}

/**
 * Builds a flat `{ fieldName: sampleValue }` map for all fields in a step.
 * For repeatable blocks the map contains `{ [arrayName]: [itemObject] }`.
 *
 * Used by the dev-mode "Import" button in StepFormEngine.
 */
export function getStepDevData(step: StepConfig): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const block of step.blocks) {
    if (block.repeatable) {
      const { arrayName } = block.repeatable;
      const item: Record<string, unknown> = {};
      for (const field of block.fields) {
        item[field.name] = fieldSampleValue(field);
      }
      data[arrayName] = [item];
      continue;
    }

    for (const field of block.fields) {
      if (field.hide) continue;
      if (field.name in data) continue; // first definition wins (shared field arrays)
      data[field.name] = fieldSampleValue(field);
    }
  }

  return data;
}
