"use client";

import {
  FormControl,
  FormDescription,
  FormFieldContext,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { type FieldValues, useFormContext } from "react-hook-form";
import type { BaseFieldProps } from "./types";

interface TextareaFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  rows?: number;
}

function TextareaField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  required,
  disabled,
  description,
  rows = 3,
}: TextareaFieldProps<TFieldValues>) {
  const { register } = useFormContext<TFieldValues>();

  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItem>
        <FormLabel>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </FormLabel>
        <FormControl>
          <Textarea
            {...register(name)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            aria-required={required}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    </FormFieldContext.Provider>
  );
}

export { TextareaField };
