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
    const s = z.date({
      required_error: msgs.required ?? `${field.label} is required`,
      invalid_type_error: "Invalid date",
    });
    return isRequired ? s : s.optional();
  }

  // ---- number ----
  if (field.type === "number") {
    let s = z.coerce.number({
      invalid_type_error: `${field.label} must be a number`,
    });
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

function collectAllFields(
  config: NormalFormConfig | StepFormConfig,
): FieldConfig[] {
  if (config.mode === "normal") {
    return config.blocks.flatMap((b) => b.fields);
  }
  return config.steps.flatMap((step) => step.blocks.flatMap((b) => b.fields));
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
  const shape: z.ZodRawShape = {};
  for (const field of collectAllFields(config)) {
    shape[field.name] = buildFieldSchema(field);
  }
  return z.object(shape);
}

// ---------------------------------------------------------------------------
// Public: buildDefaultValues
// ---------------------------------------------------------------------------

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
  for (const field of collectAllFields(config)) {
    switch (field.type) {
      case "checkbox":
        defaults[field.name] = false;
        break;
      case "checkbox-group":
        defaults[field.name] = [];
        break;
      case "file":
        defaults[field.name] = null;
        break;
      case "number":
      case "date":
        defaults[field.name] = undefined;
        break;
      default:
        defaults[field.name] = "";
    }
  }
  return defaults;
}
