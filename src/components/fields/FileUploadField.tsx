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
import { FileText, UploadCloudIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import {
  type FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import type { BaseFieldProps } from "./types";

// ---------------------------------------------------------------------------
// Uploaded file reference — stored in DB as { url, originalName }
// ---------------------------------------------------------------------------

type UploadedFileRef = { url: string; originalName: string };

function isUploadedRef(v: unknown): v is UploadedFileRef {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    typeof (v as Record<string, unknown>).url === "string" &&
    typeof (v as Record<string, unknown>).originalName === "string"
  );
}

type FileItem =
  | { kind: "file"; file: File; arrayIndex: number }
  | { kind: "ref"; url: string; name: string; arrayIndex: number };

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
      const existing: unknown[] = Array.isArray(field.value)
        ? (field.value as unknown[])
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

  function removeFile(arrayIndex?: number) {
    if (multiple && Array.isArray(field.value)) {
      const next = (field.value as unknown[]).filter(
        (_, i) => i !== arrayIndex,
      );
      field.onChange(next.length > 0 ? next : null);
    } else {
      field.onChange(null);
    }
  }

  const rawValue: unknown = field.value;

  // Build unified display items — handles File (newly selected) and
  // UploadedFileRef { url, originalName } (loaded from DB in edit mode).
  const displayItems: FileItem[] = (() => {
    if (multiple) {
      const arr = Array.isArray(rawValue) ? (rawValue as unknown[]) : [];
      return arr.reduce<FileItem[]>((acc, v, idx) => {
        if (v instanceof File)
          acc.push({ kind: "file", file: v, arrayIndex: idx });
        else if (isUploadedRef(v))
          acc.push({
            kind: "ref",
            url: v.url,
            name: v.originalName,
            arrayIndex: idx,
          });
        return acc;
      }, []);
    }
    if (rawValue instanceof File)
      return [{ kind: "file", file: rawValue, arrayIndex: 0 }];
    if (isUploadedRef(rawValue))
      return [
        {
          kind: "ref",
          url: rawValue.url,
          name: rawValue.originalName,
          arrayIndex: 0,
        },
      ];
    return [];
  })();

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
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  hasError && "border-destructive text-destructive",
                  disabled && "pointer-events-none",
                )}
              >
                {displayItems.length > 0 ? "Replace" : "Choose File"}
              </button>
              {displayItems.length === 0 ? (
                <span className="truncate text-sm text-muted-foreground">
                  No file chosen
                </span>
              ) : displayItems[0].kind === "ref" ? (
                <a
                  href={displayItems[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{displayItems[0].name}</span>
                </a>
              ) : (
                <span className="truncate text-sm text-muted-foreground">
                  {displayItems.length === 1
                    ? displayItems[0].file.name
                    : `${displayItems.length} files`}
                </span>
              )}
              {displayItems.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    removeFile(
                      multiple ? displayItems[0].arrayIndex : undefined,
                    )
                  }
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
        {variant === "dropzone" && displayItems.length > 0 && (
          <ul className="mt-2 space-y-1">
            {displayItems.map((item) => (
              <li
                key={
                  item.kind === "file"
                    ? `${item.file.name}-${item.arrayIndex}`
                    : item.url
                }
                className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-1.5 text-sm"
              >
                {item.kind === "ref" ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-1.5 truncate font-medium text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </a>
                ) : (
                  <span className="truncate text-foreground">
                    {item.file.name}
                  </span>
                )}
                <div className="ml-3 flex shrink-0 items-center gap-2 text-muted-foreground">
                  {item.kind === "file" && (
                    <span className="text-xs">
                      {formatSize(item.file.size)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(multiple ? item.arrayIndex : undefined);
                    }}
                    disabled={disabled}
                    aria-label={`Remove ${item.kind === "file" ? item.file.name : item.name}`}
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
