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

interface TextInputFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  type?: "text" | "email" | "password" | "url" | "search" | "tel";
  autoComplete?: string;
}

function TextInputField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required,
  disabled,
  description,
  type = "text",
  autoComplete,
}: TextInputFieldProps<TFieldValues>) {
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
              {...field}
              value={field.value ?? ""}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
              aria-required={required}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { TextInputField };
