"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type FieldValues } from "react-hook-form";
import type { BaseFieldProps } from "./types";

interface NumberInputFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  min?: number;
  max?: number;
  step?: number;
}

function NumberInputField<TFieldValues extends FieldValues>({
  control,
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
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
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
              // Convert the string value from the DOM to a number for RHF
              value={field.value ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val === "" ? undefined : e.target.valueAsNumber);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { NumberInputField };
