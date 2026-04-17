"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FieldValues } from "react-hook-form";
import type { BaseFieldProps, SelectOption } from "./types";

interface SelectFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  options: SelectOption[];
}

function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select an option",
  required,
  disabled,
  description,
  options,
}: SelectFieldProps<TFieldValues>) {
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
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger aria-required={required} className="w-full">
                <SelectValue placeholder={placeholder}>
                  {field.value
                    ? (options.find((o) => o.value === field.value)?.label ??
                      "")
                    : undefined}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { SelectField };
