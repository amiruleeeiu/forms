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
  fetcher: (params?: Record<string, string>) => Promise<SelectOption[]>;
  /** dot-path of a field whose value is forwarded to fetcher as a param */
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
  | "email"
  | "password"
  | "url"
  | "tel"
  | "number"
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
