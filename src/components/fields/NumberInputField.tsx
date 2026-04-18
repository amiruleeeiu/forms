"use client";

import {
  FormControl,
  FormDescription,
  FormFieldContext,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  type FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import type { BaseFieldProps } from "./types";

interface NumberInputFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  min?: number;
  max?: number;
  step?: number;
}

function NumberInputField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  required,
  disabled,
  description,
  min,
  max,
  step,
}: NumberInputFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const {
    field: { value, onChange, onBlur, name: fieldName, ref },
  } = useController({ name, control });

  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItem>
        <FormLabel>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </FormLabel>
        <FormControl>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={placeholder}
            disabled={disabled}
            aria-required={required}
            min={min}
            max={max}
            step={step}
            value={value ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === "" ? undefined : e.target.valueAsNumber);
            }}
            onBlur={onBlur}
            name={fieldName}
            ref={ref}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    </FormFieldContext.Provider>
  );
}

export { NumberInputField };
