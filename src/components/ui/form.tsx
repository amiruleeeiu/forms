"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Form — thin wrapper around RHF FormProvider
// ---------------------------------------------------------------------------
const Form = FormProvider;

// ---------------------------------------------------------------------------
// FormFieldContext — carries the field name so children can look it up
// ---------------------------------------------------------------------------
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

// ---------------------------------------------------------------------------
// FormField — thin wrapper around RHF Controller
// ---------------------------------------------------------------------------
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// useFormField — used internally by FormLabel, FormControl, FormMessage, etc.
// ---------------------------------------------------------------------------
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext.name) {
    throw new Error("useFormField must be used within a <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

// ---------------------------------------------------------------------------
// FormItemContext — provides a stable id to link label ↔ input ↔ message
// ---------------------------------------------------------------------------
type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

// ---------------------------------------------------------------------------
// FormItem — wrapper div that creates a unique id context
// ---------------------------------------------------------------------------
function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("flex flex-col gap-1.5", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// FormLabel — label element that turns red when the field has an error
// ---------------------------------------------------------------------------
function FormLabel({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { error, formItemId } = useFormField();
  return (
    <label
      data-slot="form-label"
      htmlFor={formItemId}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-destructive",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// FormControl — renders its child with aria-invalid + aria-describedby wired up
// ---------------------------------------------------------------------------
function FormControl({
  children,
}: {
  children: React.ReactElement<{
    id?: string;
    "aria-invalid"?: boolean | "true" | "false";
    "aria-describedby"?: string;
    "aria-required"?: boolean | "true" | "false";
  }>;
}) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return React.cloneElement(children, {
    id: formItemId,
    "aria-invalid": !!error,
    "aria-describedby": !error
      ? formDescriptionId
      : `${formDescriptionId} ${formMessageId}`,
  });
}

// ---------------------------------------------------------------------------
// FormDescription — helper text beneath the input
// ---------------------------------------------------------------------------
function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      id={formDescriptionId}
      data-slot="form-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// FormMessage — displays the Zod validation error (or a custom message)
// ---------------------------------------------------------------------------
function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) return null;

  return (
    <p
      id={formMessageId}
      role="alert"
      data-slot="form-message"
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
