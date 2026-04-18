"use client";

import {
  CheckboxField,
  CheckboxGroupField,
  DatePickerField,
  FileUploadField,
  NumberInputField,
  PhoneInputField,
  RadioGroupField,
  SearchableSelectField,
  SelectField,
  TextInputField,
} from "@/components/fields";
import type { SelectOption } from "@/components/fields/types";
import { useCondition } from "./hooks/useCondition";
import { useDynamicOptions } from "./hooks/useDynamicOptions";
import type { FieldConfig } from "./types";

// ---------------------------------------------------------------------------
// Inner component for fields that need options (select, radio, checkbox-group)
// Isolated so useDynamicOptions is only called for option-bearing fields.
// ---------------------------------------------------------------------------

type OptionsFieldProps = {
  config: FieldConfig;
  disabled: boolean;
};

function OptionsField({ config, disabled }: OptionsFieldProps) {
  const { options, loading } = useDynamicOptions(config.options);

  const commonProps = {
    name: config.name as never,
    label: config.label,
    placeholder: config.placeholder,
    required: config.required !== false,
    disabled: disabled || loading,
    description: config.description,
  };

  if (config.type === "select") {
    return <SelectField {...commonProps} options={options as SelectOption[]} />;
  }

  if (config.type === "searchable-select") {
    return (
      <SearchableSelectField
        {...commonProps}
        options={options as SelectOption[]}
        emptyText={config.emptyText}
      />
    );
  }

  if (config.type === "radio-group") {
    return (
      <RadioGroupField {...commonProps} options={options as SelectOption[]} />
    );
  }

  if (config.type === "checkbox-group") {
    return (
      <CheckboxGroupField
        {...commonProps}
        options={options as SelectOption[]}
      />
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// FieldRenderer — public component
// ---------------------------------------------------------------------------

type FieldRendererProps = {
  config: FieldConfig;
};

/**
 * Renders a single field based on its config.
 *
 * Visibility priority (first match wins):
 * 1. config.hide === true → null  (static, no hooks needed after this)
 * 2. hideWhen condition is true → null
 * 3. showWhen condition is false → null
 * 4. disableWhen condition is true → disabled field
 */
export function FieldRenderer({ config }: FieldRendererProps) {
  // Hooks must be called unconditionally.
  const shouldShow = useCondition(config.showWhen); // default true
  const shouldHide = useCondition(config.hideWhen, false); // default false
  const isDisabledByCondition = useCondition(config.disableWhen, false); // default false

  // Static hide — evaluated after hooks to obey rules of hooks.
  if (config.hide || shouldHide || !shouldShow) return null;

  const disabled = !!config.disabled || isDisabledByCondition;

  const commonProps = {
    name: config.name as never,
    label: config.label,
    placeholder: config.placeholder,
    // Fields are required by default (matching buildSchema behaviour); only
    // pass false when explicitly opted out.
    required: config.required !== false,
    disabled,
    description: config.description,
  };

  switch (config.type) {
    case "text":
    case "email":
    case "password":
    case "url":
    case "tel":
      return (
        <TextInputField
          {...commonProps}
          type={config.type}
          autoComplete={config.autoComplete}
        />
      );

    case "number":
      return (
        <NumberInputField
          {...commonProps}
          min={config.min}
          max={config.max}
          step={config.step}
        />
      );

    case "date":
      return (
        <DatePickerField
          {...commonProps}
          minDate={config.minDate}
          maxDate={config.maxDate}
          dateFormat={config.dateFormat}
        />
      );

    case "phone":
      return <PhoneInputField {...commonProps} />;

    case "select":
    case "searchable-select":
    case "radio-group":
    case "checkbox-group":
      return <OptionsField config={config} disabled={disabled} />;

    case "checkbox":
      return <CheckboxField {...commonProps} />;

    case "file":
      return (
        <FileUploadField
          {...commonProps}
          accept={config.accept}
          maxSizeMB={config.maxSizeMB}
          multiple={config.multiple}
          variant={config.fileVariant}
        />
      );

    default:
      return null;
  }
}
