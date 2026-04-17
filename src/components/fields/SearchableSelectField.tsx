"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { type FieldValues } from "react-hook-form";
import type { BaseFieldProps, SelectOption } from "./types";

interface SearchableSelectFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  options: SelectOption[];
  emptyText?: string;
}

// Inner component so we can call useFormField() inside the FormItem context
function SearchableTrigger({
  field,
  open,
  setOpen,
  placeholder,
  disabled,
  required,
  options,
  emptyText,
}: {
  field: ControllerRenderProps;
  open: boolean;
  setOpen: (v: boolean) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  options: SelectOption[];
  emptyText: string;
}) {
  const { formItemId, error, formDescriptionId, formMessageId } =
    useFormField();

  const selectedLabel = options.find((o) => o.value === field.value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={formItemId}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-expanded={open}
        aria-describedby={
          error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
        }
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          !field.value && "text-muted-foreground",
        )}
      >
        <span className="truncate">{selectedLabel ?? placeholder}</span>
        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[--anchor-width] p-0">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  data-checked={field.value === option.value}
                  onSelect={(value) => {
                    field.onChange(value === field.value ? "" : value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SearchableSelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select an option",
  required,
  disabled,
  description,
  options,
  emptyText = "No results found.",
}: SearchableSelectFieldProps<TFieldValues>) {
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
          <SearchableTrigger
            field={field as ControllerRenderProps}
            open={open}
            setOpen={setOpen}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            options={options}
            emptyText={emptyText}
          />
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { SearchableSelectField };
