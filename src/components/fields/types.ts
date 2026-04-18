import type { FieldPath, FieldValues } from "react-hook-form";

/**
 * Base props shared by every reusable field component.
 * TFieldValues is the form schema type (inferred from z.infer<typeof schema>).
 */
export interface BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  /** Dot-path name matching the schema key (e.g. "name", "address.city") */
  name: FieldPath<TFieldValues>;
  /** Visible label text */
  label: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Appends a red asterisk to the label and sets aria-required */
  required?: boolean;
  /** Disables the input */
  disabled?: boolean;
  /** Helper text rendered below the input */
  description?: string;
}

/** Shape of a select / radio / checkbox option */
export interface SelectOption {
  label: string;
  value: string;
}
