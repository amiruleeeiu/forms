"use client";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  FormDescription,
  FormFieldContext,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import {
  type ControllerRenderProps,
  type FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import type { BaseFieldProps, SelectOption } from "./types";

interface SearchableSelectFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  options: SelectOption[];
  emptyText?: string;
}

// Inner component so we can call useFormField() inside the FormItem context
function SearchableComboboxInner({
  field,
  placeholder,
  disabled,
  required,
  options,
  emptyText,
}: {
  field: ControllerRenderProps;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  options: SelectOption[];
  emptyText: string;
}) {
  const { formItemId, formDescriptionId, formMessageId, error } =
    useFormField();

  return (
    <Combobox
      value={field.value ?? ""}
      onValueChange={(v) => {
        const str = v as string | null;
        field.onChange(str ?? "");
      }}
      items={options.map((o) => o.value)}
      itemToStringValue={(item) => item as string}
      itemToStringLabel={(item) => {
        const opt = options.find((o) => o.value === (item as string));
        return opt?.label ?? (item as string);
      }}
    >
      <ComboboxInput
        id={formItemId}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
        }
        placeholder={placeholder}
        showClear={!!field.value}
        className="w-full"
        onBlur={field.onBlur}
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>{emptyText}</ComboboxEmpty>
          <ComboboxCollection>
            {(item) => {
              const opt = options.find((o) => o.value === (item as string));
              return (
                <ComboboxItem key={item as string} value={item as string}>
                  {opt?.label ?? (item as string)}
                </ComboboxItem>
              );
            }}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function SearchableSelectField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = "Select an option",
  required,
  disabled,
  description,
  options,
  emptyText = "No results found.",
}: SearchableSelectFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field } = useController({ name, control });

  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItem>
        <FormLabel>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </FormLabel>
        <SearchableComboboxInner
          field={field as ControllerRenderProps}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          options={options}
          emptyText={emptyText}
        />
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    </FormFieldContext.Provider>
  );
}

export { SearchableSelectField };
