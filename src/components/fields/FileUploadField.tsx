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
import { UploadCloudIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import {
  type FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import type { BaseFieldProps } from "./types";

interface FileUploadFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  /** Allowed file extensions without dots, e.g. ["pdf", "jpg", "png"] */
  accept?: string[];
  /** Maximum file size in megabytes */
  maxSizeMB?: number;
  /** Allow multiple files (defaults to false) */
  multiple?: boolean;
  /**
   * Upload style.
   * - "dropzone" (default): drag-and-drop zone
   * - "inline": compact single-row "Choose File" button
   */
  variant?: "dropzone" | "inline";
}

function FileUploadField<TFieldValues extends FieldValues>({
  name,
  label,
  required,
  disabled,
  description,
  accept,
  maxSizeMB,
  multiple = false,
  variant = "dropzone",
}: FileUploadFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field, fieldState } = useController({ name, control });
  const inputRef = useRef<HTMLInputElement>(null);

  const hasError = !!fieldState.error;

  const acceptAttr = accept
    ? accept.map((ext) => (ext.startsWith(".") ? ext : `.${ext}`)).join(",")
    : undefined;

  const acceptDisplay = accept
    ? accept.map((e) => e.toUpperCase()).join(", ")
    : undefined;

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (multiple) {
      const existing: File[] = Array.isArray(field.value)
        ? (field.value as File[])
        : [];
      field.onChange([...existing, ...Array.from(files)]);
    } else {
      field.onChange(files[0]);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    // Reset so the same file can be re-selected after removal
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function removeFile(index?: number) {
    if (multiple && Array.isArray(field.value)) {
      const next = (field.value as File[]).filter((_, i) => i !== index);
      field.onChange(next.length > 0 ? next : null);
    } else {
      field.onChange(null);
    }
  }

  const files: File[] = multiple
    ? Array.isArray(field.value)
      ? (field.value as File[])
      : []
    : field.value instanceof File
      ? [field.value as File]
      : [];

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItem>
        <FormLabel>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </FormLabel>
        <FormControl>
          {variant === "inline" ? (
            /* ---- Inline variant: compact "Choose File" row ---- */
            <div
              className={cn(
                "flex items-center gap-3",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && inputRef.current?.click()}
                aria-required={required}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  hasError && "border-destructive text-destructive",
                  disabled && "pointer-events-none",
                )}
              >
                Choose File
              </button>
              <span className="truncate text-sm text-muted-foreground">
                {files.length === 0
                  ? "No file chosen"
                  : files.length === 1
                    ? files[0].name
                    : `${files.length} files`}
              </span>
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={() => removeFile()}
                  disabled={disabled}
                  aria-label="Remove file"
                  className="ml-auto shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={acceptAttr}
                multiple={multiple}
                disabled={disabled}
                onChange={handleInputChange}
                className="sr-only"
                aria-hidden="true"
              />
            </div>
          ) : (
            /* ---- Dropzone variant (default) ---- */
            <div
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              aria-required={required}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !disabled && inputRef.current?.click()}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !disabled) {
                  inputRef.current?.click();
                }
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors",
                hasError
                  ? "border-destructive bg-destructive/5"
                  : "border-input hover:border-primary/50 hover:bg-muted/40",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <UploadCloudIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag &amp; drop files here, or{" "}
                <span className="font-medium text-primary underline-offset-2 hover:underline">
                  click to select
                </span>
              </p>
              {acceptDisplay && (
                <p className="text-xs text-muted-foreground">
                  Accepted: {acceptDisplay}
                </p>
              )}
              {maxSizeMB && (
                <p className="text-xs text-muted-foreground">
                  Max size: {maxSizeMB}.00MB
                </p>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={acceptAttr}
                multiple={multiple}
                disabled={disabled}
                onChange={handleInputChange}
                className="sr-only"
                aria-hidden="true"
              />
            </div>
          )}
        </FormControl>
        {variant === "dropzone" && files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-1.5 text-sm"
              >
                <span className="truncate text-foreground">{file.name}</span>
                <div className="ml-3 flex shrink-0 items-center gap-2 text-muted-foreground">
                  <span className="text-xs">{formatSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(multiple ? i : undefined);
                    }}
                    disabled={disabled}
                    aria-label={`Remove ${file.name}`}
                    className="rounded-sm p-0.5 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    </FormFieldContext.Provider>
  );
}

export { FileUploadField };
