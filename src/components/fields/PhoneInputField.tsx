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
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import { type FieldValues } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { BaseFieldProps } from "./types";

// A shadcn-styled input that react-phone-number-input passes its props into
const PhoneInputComponent = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function PhoneInputComponent({ className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      className={cn("rounded-l-none border-l-0", className)}
      {...props}
    />
  );
});

function PhoneInputField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Enter phone number",
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
          <FormLabel>
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            {/* PhoneInput renders a <div> but FormControl only clones the direct element */}
            <div aria-required={required ? true : undefined}>
              <PhoneInput
                international
                defaultCountry="US"
                placeholder={placeholder}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                inputComponent={PhoneInputComponent}
                className="phone-input-wrapper flex h-8 w-full rounded-lg border border-input bg-transparent"
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { PhoneInputField };
