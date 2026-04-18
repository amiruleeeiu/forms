"use client";

import {
  FormControl,
  FormDescription,
  FormFieldContext,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import type { BaseFieldProps, SelectOption } from "./types";

interface RadioGroupFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  options: SelectOption[];
}

function RadioGroupField<TFieldValues extends FieldValues>({
  name,
  label,
  required,
  disabled,
  description,
  options,
}: RadioGroupFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field } = useController({ name, control });

  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItem>
        <FormLabel>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </FormLabel>
        {description && <FormDescription>{description}</FormDescription>}
        <FormControl>
          <RadioGroup
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
            aria-required={required}
            className="flex flex-col gap-2"
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                />
                <label
                  htmlFor={`${name}-${option.value}`}
                  className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormFieldContext.Provider>
  );
}

export { RadioGroupField };
