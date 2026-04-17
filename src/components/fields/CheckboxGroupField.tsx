"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type FieldValues } from "react-hook-form";
import type { BaseFieldProps, SelectOption } from "./types";

interface CheckboxGroupFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  options: SelectOption[];
}

function CheckboxGroupField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  description,
  options,
}: CheckboxGroupFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const currentValues: string[] = Array.isArray(field.value)
          ? field.value
          : [];

        function handleChange(value: string, checked: boolean) {
          if (checked) {
            field.onChange([...currentValues, value]);
          } else {
            field.onChange(currentValues.filter((v) => v !== value));
          }
        }

        return (
          <FormItem>
            <div className="mb-1">
              <FormLabel>
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
              </FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
            </div>
            <div
              role="group"
              aria-label={label}
              aria-required={required}
              className="flex flex-col gap-2"
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${name}-${option.value}`}
                    checked={currentValues.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleChange(option.value, !!checked)
                    }
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`${name}-${option.value}`}
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export { CheckboxGroupField };
