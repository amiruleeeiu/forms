import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";
import type { FieldConfig, NormalFormConfig, StepFormConfig } from "../types";

// ---------------------------------------------------------------------------
// Per-field Zod schema builder
// ---------------------------------------------------------------------------

function buildFieldSchema(field: FieldConfig): z.ZodTypeAny {
  const v = field.validation ?? {};
  const msgs = v.messages ?? {};
  // Fields are required by default; pass `required: false` to make optional.
  const isRequired = field.required !== false;

  // ---- checkbox ----
  // required checkbox means "must be checked" (e.g. accept terms)
  if (field.type === "checkbox") {
    if (isRequired) {
      return z.boolean().refine((val) => val === true, {
        message: msgs.required ?? `${field.label} is required`,
      });
    }
    return z.boolean();
  }

  // ---- checkbox-group ----
  if (field.type === "checkbox-group") {
    const arr = z.array(z.string());
    return isRequired
      ? arr.min(
          1,
          msgs.required ?? `Select at least one ${field.label.toLowerCase()}`,
        )
      : arr;
  }

  // ---- date ----
  if (field.type === "date") {
    const s = z.date({ error: msgs.required ?? `${field.label} is required` });
    return isRequired ? s : s.optional();
  }

  // ---- number ----
  if (field.type === "number") {
    let s = z.coerce.number({ error: `${field.label} must be a number` });
    const minVal = field.min;
    const maxVal = field.max;
    if (minVal !== undefined) s = s.min(minVal, `Minimum value is ${minVal}`);
    if (maxVal !== undefined) s = s.max(maxVal, `Maximum value is ${maxVal}`);
    return isRequired ? s : s.optional();
  }

  // ---- file ----
  if (field.type === "file") {
    const fileSchema = z.custom<File | null>(
      (val) => {
        if (!isRequired) return true;
        return val instanceof File;
      },
      {
        message:
          field.validation?.messages?.required ?? `${field.label} is required`,
      },
    );
    if (field.maxSizeMB !== undefined) {
      const maxBytes = field.maxSizeMB * 1024 * 1024;
      return fileSchema.refine(
        (val) => !(val instanceof File) || val.size <= maxBytes,
        { message: `File must be smaller than ${field.maxSizeMB}MB` },
      );
    }
    return fileSchema;
  }

  // ---- phone ----
  if (field.type === "phone") {
    let s = z.string();
    if (isRequired) s = s.min(1, msgs.required ?? `${field.label} is required`);

    if (v.validatePhone !== false) {
      const withPhone = s.refine(
        (val) => {
          if (!val) return !isRequired;
          try {
            return isValidPhoneNumber(val);
          } catch {
            return false;
          }
        },
        {
          message:
            msgs.phone ?? "Enter a valid phone number (e.g. +880 1700 000000)",
        },
      );
      return isRequired ? withPhone : withPhone.optional();
    }
    return isRequired ? s : s.optional();
  }

  // ---- string fields (text, email, password, url, tel, select, etc.) ----
  let s: z.ZodString = z.string();

  if (field.type === "email") s = s.email(msgs.email ?? "Invalid email");
  if (field.type === "url") s = s.url(msgs.url ?? "Invalid URL");

  if (v.minLength !== undefined) {
    s = s.min(
      v.minLength,
      msgs.minLength ?? `At least ${v.minLength} characters required`,
    );
  }
  if (v.maxLength !== undefined) {
    s = s.max(
      v.maxLength,
      msgs.maxLength ?? `Maximum ${v.maxLength} characters`,
    );
  }
  if (v.pattern !== undefined) {
    s = s.regex(new RegExp(v.pattern), msgs.pattern ?? "Invalid format");
  }

  // required string with no explicit minLength → must not be empty
  if (isRequired && v.minLength === undefined) {
    s = s.min(1, msgs.required ?? `${field.label} is required`);
  }

  return isRequired ? s : s.optional();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wraps any Zod schema as optional — no-op if already optional. */
function makeOptional(schema: z.ZodTypeAny): z.ZodTypeAny {
  return schema instanceof z.ZodOptional ? schema : schema.optional();
}

/**
 * Wraps a schema so that empty/absent values ("", null, [], false for
 * checkboxes) are coerced to undefined and accepted as "not provided".
 * This is needed for conditional fields whose RHF default value ("", null,
 * false, []) would otherwise fail a required schema rule.
 */
function makeConditionalOptional(schema: z.ZodTypeAny): z.ZodTypeAny {
  return z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    if (Array.isArray(val) && val.length === 0) return undefined;
    return val;
  }, makeOptional(schema));
}

/**
 * Same as makeConditionalOptional but also treats an array whose every item
 * is all-empty (all field values are "", null, or undefined — the seed state
 * from buildDefaultValues) as absent. This handles conditional repeatable
 * blocks where the default is [{field:"",…}] rather than [].
 */
function makeConditionalRepeatableOptional(schema: z.ZodTypeAny): z.ZodTypeAny {
  return z.preprocess((val) => {
    if (!Array.isArray(val) || val.length === 0) return undefined;
    const allEmpty = val.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        Object.values(item as Record<string, unknown>).every(
          (v) => v === "" || v === null || v === undefined || v === false,
        ),
    );
    if (allEmpty) return undefined;
    return val;
  }, makeOptional(schema));
}

// ---------------------------------------------------------------------------
// Public: buildSchemaFromConfig
// ---------------------------------------------------------------------------

/**
 * Derives a Zod validation schema automatically from a form config.
 * No separate schema file needed — define everything in the config.
 *
 * Rules per field type:
 * - Fields are **required by default**; add `required: false` to make optional
 * - `required: false`       → field is optional (no empty-check)
 * - `type: "email"`         → `.email()` format check
 * - `type: "url"`           → `.url()` format check
 * - `type: "phone"`         → E.164 check via isValidPhoneNumber
 *                             (disable with `validation.validatePhone: false`)
 * - `type: "number"`        → `z.coerce.number()` with FieldConfig min/max
 * - `type: "date"`          → `z.date()`
 * - `type: "checkbox"` + required → must equal `true`
 * - `type: "checkbox-group"` + required → array must have ≥1 item
 * - `validation.minLength / maxLength / pattern` → applied as extra rules
 * - `validation.messages`   → override all auto-generated error messages
 */
export function buildSchemaFromConfig(
  config: NormalFormConfig | StepFormConfig,
): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodTypeAny> = {};

  const blocks =
    config.mode === "normal"
      ? config.blocks
      : config.steps.flatMap((s) => s.blocks);

  for (const block of blocks) {
    const blockIsConditional = !!(block.showWhen || block.hideWhen);

    // ---- Repeatable block: builds z.array(z.object({...})) ----
    if (block.repeatable) {
      const { arrayName, minItems = 0 } = block.repeatable;
      if (arrayName in shape) continue;
      const subShape: Record<string, z.ZodTypeAny> = {};
      for (const field of block.fields) {
        subShape[field.name] = buildFieldSchema(field);
      }
      const itemSchema = z.object(subShape as z.ZodRawShape);
      let arraySchema: z.ZodTypeAny = z.array(itemSchema);
      if (minItems > 0) {
        arraySchema = (arraySchema as z.ZodArray<typeof itemSchema>).min(
          minItems,
          `At least ${minItems} entry required`,
        );
      }
      shape[arrayName] = blockIsConditional
        ? makeConditionalRepeatableOptional(arraySchema)
        : arraySchema;
      continue;
    }

    for (const field of block.fields) {
      // First block definition wins — shared field arrays (e.g. address fields
      // reused across multiple conditional blocks) get registered only once.
      if (field.name in shape) continue;

      const isConditional =
        blockIsConditional || !!(field.showWhen || field.hideWhen);

      let fieldSchema = buildFieldSchema(field);

      // Fields inside conditional blocks may not be visible at submission time.
      // Make them optional in the Zod schema so hidden fields never block
      // form.trigger(). The required asterisk / UX enforcement still happens
      // in the UI via the `required` prop on the field component.
      if (isConditional) fieldSchema = makeConditionalOptional(fieldSchema);

      shape[field.name] = fieldSchema;
    }
  }

  return z.object(shape as z.ZodRawShape);
}
// ---------------------------------------------------------------------------

/** Returns the empty default value for a single field (used for repeatable item seeding). */
export function buildFieldDefaultValue(field: FieldConfig): unknown {
  switch (field.type) {
    case "checkbox":
      return false;
    case "checkbox-group":
      return [];
    case "file":
      return null;
    case "number":
    case "date":
      return undefined;
    default:
      return "";
  }
}

/**
 * Derives empty default values from a form config so you don't need to
 * maintain a parallel `defaultValues` object.
 *
 * - `checkbox`       → `false`
 * - `checkbox-group` → `[]`
 * - `number` / `date` → `undefined`
 * - everything else  → `""`
 */
export function buildDefaultValues(
  config: NormalFormConfig | StepFormConfig,
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  const blocks =
    config.mode === "normal"
      ? config.blocks
      : config.steps.flatMap((s) => s.blocks);

  for (const block of blocks) {
    // Repeatable block: seed with one empty item
    if (block.repeatable) {
      const { arrayName } = block.repeatable;
      if (arrayName in defaults) continue;
      const itemDefaults: Record<string, unknown> = {};
      for (const field of block.fields) {
        itemDefaults[field.name] = buildFieldDefaultValue(field);
      }
      defaults[arrayName] = [itemDefaults];
      continue;
    }

    for (const field of block.fields) {
      if (field.name in defaults) continue;
      defaults[field.name] = buildFieldDefaultValue(field);
    }
  }

  return defaults;
}
