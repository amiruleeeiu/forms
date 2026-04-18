"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormFieldContext,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  type FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import type { BaseFieldProps } from "./types";

function CheckboxField<TFieldValues extends FieldValues>({
  name,
  label,
  required,
  disabled,
  description,
}: BaseFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field } = useController({ name, control });

  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItem>
        <div className="flex items-start gap-2">
          <FormControl>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-required={required}
              id={undefined} // let FormControl inject the id
            />
          </FormControl>
          <div className="flex flex-col gap-1 leading-none">
            <FormLabel
              className={cn(
                required &&
                  "after:ml-0.5 after:text-destructive after:content-['*']",
              )}
            >
              {label}
            </FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
        </div>
        <FormMessage />
      </FormItem>
    </FormFieldContext.Provider>
  );
}

export { CheckboxField };
