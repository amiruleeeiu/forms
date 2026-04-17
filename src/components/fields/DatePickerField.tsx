"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { type ControllerRenderProps, type FieldValues } from "react-hook-form";
import type { BaseFieldProps } from "./types";

interface DatePickerFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  /** Earliest selectable date */
  minDate?: Date;
  /** Latest selectable date */
  maxDate?: Date;
  /** date-fns format string, defaults to "PPP" (e.g. "April 17, 2026") */
  dateFormat?: string;
}

// Inner component so we can call useFormField() inside a FormItem/FormField tree
function DateTrigger({
  field,
  open,
  setOpen,
  placeholder,
  disabled,
  required,
  dateFormat,
  minDate,
  maxDate,
}: {
  field: ControllerRenderProps;
  open: boolean;
  setOpen: (v: boolean) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  dateFormat: string;
  minDate?: Date;
  maxDate?: Date;
}) {
  const { formItemId, error, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={formItemId}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
        }
        className={cn(
          "flex h-8 w-full items-center justify-start gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          !field.value && "text-muted-foreground",
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0" />
        {field.value ? (
          <span>{format(field.value as Date, dateFormat)}</span>
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={field.value as Date | undefined}
          onSelect={(date) => {
            field.onChange(date);
            setOpen(false);
          }}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function DatePickerField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Pick a date",
  required,
  disabled,
  description,
  minDate,
  maxDate,
  dateFormat = "PPP",
}: DatePickerFieldProps<TFieldValues>) {
  const [open, setOpen] = useState(false);

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
          <DateTrigger
            field={field as ControllerRenderProps}
            open={open}
            setOpen={setOpen}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            dateFormat={dateFormat}
            minDate={minDate}
            maxDate={maxDate}
          />
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { DatePickerField };
