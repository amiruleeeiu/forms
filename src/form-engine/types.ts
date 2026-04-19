import type { SelectOption } from "@/components/fields/types";

// ---------------------------------------------------------------------------
// Condition expression — recursive AND/OR tree
// ---------------------------------------------------------------------------

export type ConditionOperator =
  | "eq"
  | "neq"
  | "in"
  | "not_in"
  | "truthy"
  | "falsy";

export type ConditionLeaf = {
  field: string; // dot-path, e.g. "address.district"
  operator: ConditionOperator;
  value?: unknown;
};

export type ConditionNode = {
  and?: Array<ConditionLeaf | ConditionNode>;
  or?: Array<ConditionLeaf | ConditionNode>;
};

export type ConditionExpr = ConditionLeaf | ConditionNode;

// ---------------------------------------------------------------------------
// Options — discriminated union
// ---------------------------------------------------------------------------

export type StaticOptions = {
  type: "static";
  items: SelectOption[];
};

export type DynamicOptions = {
  type: "api";
  /**
   * URL-based approach — no functions needed in the config.
   * The response must be an array of `{ label, value }` objects.
   */
  url?: string;
  /**
   * Query-parameter name to use when sending the `dependsOn` value to the API.
   * e.g. `paramName: "divisionId"` → `/api/locations/districts?divisionId=dhaka`
   */
  paramName?: string;
  /**
   * Function-based approach (advanced / backward-compatible).
   * If both `url` and `fetcher` are provided, `fetcher` takes precedence.
   */
  fetcher?: (params?: Record<string, string>) => Promise<SelectOption[]>;
  /** dot-path of a field whose value is forwarded to the API as a query param */
  dependsOn?: string;
};

export type OptionsConfig = StaticOptions | DynamicOptions;

// ---------------------------------------------------------------------------
// Field-level validation rules (embedded in config — no separate schema file)
// ---------------------------------------------------------------------------

export type FieldValidation = {
  /** Min character length for string fields */
  minLength?: number;
  /** Max character length for string fields */
  maxLength?: number;
  /** Regex pattern (as a string) to validate string fields */
  pattern?: string;
  /**
   * For phone fields: set false to skip E.164 format check.
   * Defaults to true.
   */
  validatePhone?: boolean;
  /** Custom error messages — override the auto-generated defaults */
  messages?: {
    required?: string;
    email?: string;
    url?: string;
    phone?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
  };
};

// ---------------------------------------------------------------------------
// Field config
// ---------------------------------------------------------------------------

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "password"
  | "url"
  | "tel"
  | "number"
  | "number-unit"
  | "date"
  | "phone"
  | "file"
  | "select"
  | "searchable-select"
  | "radio-group"
  | "checkbox-group"
  | "checkbox";

export type FieldConfig = {
  /** dot-path key matching the Zod schema (e.g. "address.city") */
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  /**
   * Whether the field is required. **Defaults to `true`** — fields are required
   * by default. Pass `required: false` explicitly to make a field optional.
   */
  required?: boolean;
  disabled?: boolean;
  description?: string;
  /** forwarded to <input autoComplete> for text-like fields */
  autoComplete?: string;
  // number field
  min?: number;
  max?: number;
  step?: number;
  // date field
  minDate?: Date;
  maxDate?: Date;
  /** date-fns format string, defaults to "PPP" */
  dateFormat?: string;
  // file field
  /** Accepted MIME types or extensions, e.g. ["pdf", "jpg", "png"] */
  accept?: string[];
  /** Maximum file size in megabytes */
  maxSizeMB?: number;
  /** Allow picking multiple files (defaults to false) */
  multiple?: boolean;
  // select / radio / checkbox-group
  options?: OptionsConfig;
  emptyText?: string;
  // number-unit field
  /** Options for the unit select part of a number-unit field */
  unitOptions?: OptionsConfig;
  unitPlaceholder?: string;
  /** Whether the unit select appears on the left or right of the number input. Default: "right" */
  numberUnitPosition?: "left" | "right";
  /** Statically hide the field — renders null, value kept in schema */
  hide?: boolean;
  // dynamic conditions
  showWhen?: ConditionExpr;
  hideWhen?: ConditionExpr;
  disableWhen?: ConditionExpr;
  /**
   * Extra validation rules embedded directly in the field config.
   * Used by buildSchemaFromConfig() to derive the Zod schema automatically.
   */
  validation?: FieldValidation;
  /**
   * File upload display style.
   * - "dropzone" (default): drag-and-drop zone with cloud icon
   * - "inline": compact single-row "Choose File" button
   */
  fileVariant?: "dropzone" | "inline";
  /**
   * Sample value injected when the dev-mode "Import" button is clicked.
   * If omitted, a sensible value is auto-generated from the field type.
   */
  devSampleValue?: unknown;
};

// ---------------------------------------------------------------------------
// Block config
// ---------------------------------------------------------------------------

export type BlockLayout = "single" | "2-col" | "3-col";

export type BlockConfig = {
  id: string;
  title?: string;
  description?: string;
  /** Default: "single" */
  layout?: BlockLayout;
  /**
   * When set, the block's fields will be nested under this key within the
   * parent step's output. Multiple blocks sharing the same `dataKey` are
   * merged together.
   */
  dataKey?: string;
  fields: FieldConfig[];
  showWhen?: ConditionExpr;
  hideWhen?: ConditionExpr;
  /**
   * When any of these field names change value, all fields in this block
   * are reset to their default values (cascade reset).
   * The watcher stays mounted even when the block is hidden.
   */
  resetOn?: string[];
  /**
   * When set, renders this block as a repeatable list with add / remove
   * controls using React Hook Form's useFieldArray.
   */
  repeatable?: {
    /** RHF field-array name — the array key in form values. */
    arrayName: string;
    /** Minimum rows (cannot remove below this). Default 0. */
    minItems?: number;
    /** Label for the add-item button. Default "+  Add Another". */
    addLabel?: string;
  };
};

// ---------------------------------------------------------------------------
// Step config
// ---------------------------------------------------------------------------

export type StepConfig = {
  id: string;
  title: string;
  description?: string;
  /**
   * When set, the step's fields will be nested under this key in the final
   * submitted value object (used with `groupValuesByConfig`).
   */
  dataKey?: string;
  blocks: BlockConfig[];
};

// ---------------------------------------------------------------------------
// Form config — discriminated union
// ---------------------------------------------------------------------------

export type NormalFormConfig = {
  mode: "normal";
  blocks: BlockConfig[];
  submitLabel?: string;
  resetLabel?: string;
};

export type StepFormConfig = {
  mode: "stepped";
  steps: StepConfig[];
  submitLabel?: string;
};

export type FormConfig = NormalFormConfig | StepFormConfig;

// Re-export for convenience
export type { SelectOption };
