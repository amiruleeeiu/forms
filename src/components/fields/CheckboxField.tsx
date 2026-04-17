"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { type FieldValues } from "react-hook-form";
import type { BaseFieldProps } from "./types";

function CheckboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  disabled,
  description,
}: BaseFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
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
      )}
    />
  );
}

export { CheckboxField };
