"use client";

import {
  FormDescription,
  FormFieldContext,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import {
  type FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import type { BaseFieldProps } from "./types";

export type NumberUnitValue = { amount: number | ""; unit: string };

interface NumberUnitFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  unitOptions?: { label: string; value: string }[];
  unitPlaceholder?: string;
  /** "left" = unit select on left, "right" = unit select on right. Default: "right" */
  position?: "left" | "right";
}

function NumberUnitField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = "Enter",
  required,
  disabled,
  description,
  unitOptions = [],
  unitPlaceholder = "Unit",
  position = "right",
}: NumberUnitFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field, fieldState } = useController({ name, control });

  const value = (field.value ?? { amount: "", unit: "" }) as NumberUnitValue;

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    field.onChange({ ...value, amount: raw === "" ? "" : Number(raw) });
  }

  function handleUnitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    field.onChange({ ...value, unit: e.target.value });
    field.onBlur();
  }

  const unitSelect = (
    <InputGroupAddon
      align={position === "left" ? "inline-start" : "inline-end"}
    >
      <select
        value={value.unit}
        onChange={handleUnitChange}
        onClick={(e) => e.stopPropagation()}
        disabled={disabled}
        aria-label={`${label} unit`}
        className={cn(
          "h-full bg-transparent text-sm font-medium text-foreground outline-none",
          "cursor-pointer pr-1",
          !value.unit && "text-muted-foreground",
        )}
      >
        {!value.unit && (
          <option value="" disabled>
            {unitPlaceholder}
          </option>
        )}
        {unitOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </InputGroupAddon>
  );

  const numberInput = (
    <InputGroupInput
      type="number"
      value={value.amount === 0 ? "0" : (value.amount ?? "")}
      onChange={handleAmountChange}
      onBlur={field.onBlur}
      placeholder={placeholder}
      disabled={disabled}
      aria-required={required}
      aria-invalid={fieldState.invalid}
    />
  );

  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItem>
        <FormLabel>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </FormLabel>
        <InputGroup
          data-slot="input-group"
          aria-invalid={fieldState.invalid || undefined}
        >
          {position === "left" ? (
            <>
              {unitSelect}
              {numberInput}
            </>
          ) : (
            <>
              {numberInput}
              {unitSelect}
            </>
          )}
        </InputGroup>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    </FormFieldContext.Provider>
  );
}

export { NumberUnitField };
