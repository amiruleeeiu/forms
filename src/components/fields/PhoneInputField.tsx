"use client";

import {
  FormControl,
  FormDescription,
  FormFieldContext,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import {
  type FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { BaseFieldProps } from "./types";

// A plain <input> that react-phone-number-input injects its props into,
// styled to sit flush inside the wrapper (no own border/ring).
const PhoneInputComponent = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function PhoneInputComponent({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none",
        "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

function PhoneInputField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = "Enter phone number",
  required,
  disabled,
  description,
}: BaseFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field, fieldState } = useController({ name, control });

  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItem>
        <FormLabel>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </FormLabel>
        <FormControl>
          {/* PhoneInput renders a <div> — wrap to keep FormControl happy */}
          <div aria-required={required ? true : undefined}>
            <PhoneInput
              international
              defaultCountry="BD"
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(val) => field.onChange(val ?? "")}
              onBlur={field.onBlur}
              disabled={disabled}
              inputComponent={PhoneInputComponent}
              className={cn(
                "phone-input-wrapper flex h-8 w-full items-center rounded border bg-transparent transition-colors",
                fieldState.error ? "border-destructive" : "border-input",
              )}
            />
          </div>
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    </FormFieldContext.Provider>
  );
}

export { PhoneInputField };
