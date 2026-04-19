"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import type { BlockConfig, FieldConfig, StepFormConfig } from "./types";
import { evaluateCondition } from "./utils/evaluateCondition";

// ---------------------------------------------------------------------------
// Value formatting
// ---------------------------------------------------------------------------

function resolveOptionLabel(field: FieldConfig, value: unknown): string {
  if (field.options?.type === "static") {
    const items = field.options.items;
    if (field.type === "checkbox-group" && Array.isArray(value)) {
      return value
        .map((v) => items.find((o) => o.value === v)?.label ?? String(v))
        .join(", ");
    }
    return items.find((o) => o.value === value)?.label ?? String(value ?? "—");
  }
  if (Array.isArray(value)) return value.join(", ");
  return String(value ?? "—");
}

function formatFieldValue(field: FieldConfig, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  switch (field.type) {
    case "checkbox":
      return value ? "Yes" : "No";
    case "date":
      return value instanceof Date
        ? format(value, field.dateFormat ?? "PPP")
        : String(value);
    case "select":
    case "searchable-select":
    case "radio-group":
    case "checkbox-group":
      return resolveOptionLabel(field, value);
    case "file":
      if (value instanceof File) return value.name;
      if (Array.isArray(value))
        return value
          .map((f: unknown) => (f instanceof File ? f.name : String(f)))
          .join(", ");
      return String(value);
    case "password":
      return "••••••••";
    default:
      return String(value);
  }
}

// ---------------------------------------------------------------------------
// Visibility helpers
// ---------------------------------------------------------------------------

function isBlockVisible(
  block: BlockConfig,
  values: Record<string, unknown>,
): boolean {
  if (block.showWhen && !evaluateCondition(block.showWhen, values))
    return false;
  if (block.hideWhen && evaluateCondition(block.hideWhen, values)) return false;
  return true;
}

function isFieldVisible(
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  if (field.hide) return false;
  if (field.showWhen && !evaluateCondition(field.showWhen, values))
    return false;
  if (field.hideWhen && evaluateCondition(field.hideWhen, values)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// FieldCell — label above value, used in 3-col grid
// ---------------------------------------------------------------------------

function FieldCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-base font-normal leading-6 text-[#3f4548] tracking-[0.15px]">
        {label}
      </span>
      <div className="text-base font-medium leading-[1.4] text-foreground wrap-break-word">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileLink — opens a File object or URL in a new tab
// ---------------------------------------------------------------------------

function FileLink({ rawValue }: { rawValue: unknown }) {
  // Lazy useState initializer runs once at mount — safe for side effects like
  // URL.createObjectURL without triggering "setState in effect" warnings.
  const [href] = React.useState<string | null>(() => {
    if (rawValue instanceof File) return URL.createObjectURL(rawValue);
    if (Array.isArray(rawValue)) {
      const first = rawValue.find((f): f is File => f instanceof File);
      if (first) return URL.createObjectURL(first);
    }
    if (typeof rawValue === "string" && rawValue) return rawValue;
    return null;
  });

  // Revoke object URLs on unmount.
  React.useEffect(() => {
    const isObjectUrl =
      rawValue instanceof File ||
      (Array.isArray(rawValue) &&
        rawValue.some((f): f is File => f instanceof File));
    return () => {
      if (isObjectUrl && href) URL.revokeObjectURL(href);
    };
    // Intentionally run only on unmount — rawValue is stable for the preview screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!href) return <span className="text-sm text-muted-foreground">—</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-sm font-medium text-[#007bff] hover:underline"
    >
      <FileText className="size-5 text-primary shrink-0" aria-hidden="true" />
      Open File
    </a>
  );
}

// ---------------------------------------------------------------------------
// InlineFileValue — shown in 3-col grid for file fields in mixed steps
// ---------------------------------------------------------------------------

function InlineFileValue({ rawValue }: { rawValue: unknown }) {
  const [info] = React.useState<{
    href: string;
    isImage: boolean;
    name: string;
  } | null>(() => {
    const file =
      rawValue instanceof File
        ? rawValue
        : Array.isArray(rawValue)
          ? (rawValue.find((f): f is File => f instanceof File) ?? null)
          : null;

    if (file) {
      return {
        href: URL.createObjectURL(file),
        isImage: file.type.startsWith("image/"),
        name: file.name,
      };
    }
    if (typeof rawValue === "string" && rawValue) {
      const isImage = /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(rawValue);
      return {
        href: rawValue,
        isImage,
        name: rawValue.split("/").pop() ?? rawValue,
      };
    }
    return null;
  });

  React.useEffect(() => {
    const isObjectUrl =
      rawValue instanceof File ||
      (Array.isArray(rawValue) &&
        rawValue.some((f): f is File => f instanceof File));
    return () => {
      if (isObjectUrl && info?.href) URL.revokeObjectURL(info.href);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!info) return <span className="text-muted-foreground">—</span>;

  if (info.isImage) {
    return (
      <a
        href={info.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <Image
          src={info.href}
          alt={info.name}
          width={64}
          height={64}
          className="h-16 w-16 rounded-md object-cover border border-border"
          unoptimized
        />
      </a>
    );
  }

  return <span className="wrap-break-word">{info.name}</span>;
}

// ---------------------------------------------------------------------------
// stepIsAllAttachments — true when every non-empty visible field is type=file
// ---------------------------------------------------------------------------

function stepIsAllAttachments(
  step: StepFormConfig["steps"][number],
  values: Record<string, unknown>,
): boolean {
  let total = 0;
  let fileCount = 0;

  for (const block of step.blocks) {
    if (!isBlockVisible(block, values)) continue;

    if (block.repeatable) {
      const items = values[block.repeatable.arrayName];
      if (!Array.isArray(items) || items.length === 0) continue;
      for (const item of items) {
        const iv = item as Record<string, unknown>;
        for (const field of block.fields) {
          const raw = iv[field.name];
          if (raw === null || raw === undefined || raw === "") continue;
          total++;
          if (field.type === "file") fileCount++;
        }
      }
    } else {
      for (const field of block.fields) {
        if (!isFieldVisible(field, values)) continue;
        const raw = values[field.name];
        if (raw === null || raw === undefined || raw === "") continue;
        total++;
        if (field.type === "file") fileCount++;
      }
    }
  }

  return total > 0 && total === fileCount;
}

// ---------------------------------------------------------------------------
// AttachmentTable — tabular layout for file-type fields
// ---------------------------------------------------------------------------

function AttachmentTable({
  rows,
}: {
  rows: { key: string; label: string; rawValue: unknown }[];
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#dcdfe4] shadow-sm">
      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="bg-[#f1f5f9]">
            <th className="w-25 border-b border-r border-[#dcdfe4] px-3 py-2.5 text-center font-medium text-[#1d2021] tracking-[0.15px]">
              SL. No
            </th>
            <th className="border-b border-r border-[#dcdfe4] px-4 py-2.5 text-left font-medium text-[#1d2021] tracking-[0.15px]">
              Name of Document
            </th>
            <th className="w-60 border-b border-[#dcdfe4] px-4 py-2.5 text-left font-medium text-[#1d2021] tracking-[0.15px]">
              Attached PDF file
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#dcdfe4]">
          {rows.map((row, i) => (
            <tr key={row.key} className="bg-white">
              <td className="border-r border-[#dcdfe4] px-3 py-3 text-center text-[#1d2021] tracking-[0.15px]">
                {i + 1}
              </td>
              <td className="border-r border-[#dcdfe4] px-4 py-3 font-medium leading-[1.4] text-[#374151]">
                {row.label}
              </td>
              <td className="px-4 py-3">
                <FileLink rawValue={row.rawValue} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StepAccordionHeader — wraps title + chevron in trigger, Edit button outside
// ---------------------------------------------------------------------------

function StepAccordionHeader({
  title,
  stepIndex,
  onEdit,
}: {
  title: string;
  stepIndex: number;
  onEdit?: (stepIndex: number) => void;
}) {
  return (
    <AccordionPrimitive.Header className="flex items-center justify-between border-b border-border py-5">
      <AccordionPrimitive.Trigger
        className={cn(
          "group/accordion-trigger flex flex-1 items-center gap-3 text-left outline-none",
          "rounded-sm focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <h3 className="flex-1 text-xl font-bold text-primary">{title}</h3>
        <ChevronDown
          className="size-5 shrink-0 text-foreground transition-transform group-aria-expanded/accordion-trigger:hidden"
          aria-hidden="true"
        />
        <ChevronUp
          className="hidden size-5 shrink-0 text-foreground transition-transform group-aria-expanded/accordion-trigger:inline"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className="ml-5 flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          <Pencil className="size-4.5" aria-hidden="true" />
          Edit
        </button>
      )}
    </AccordionPrimitive.Header>
  );
}

// ---------------------------------------------------------------------------
// FieldsGrid — renders fields in a responsive 3-col grid
// ---------------------------------------------------------------------------

type GridField = { key: string; label: string; value: React.ReactNode };

function FieldsGrid({ fields }: { fields: GridField[] }) {
  const rows: GridField[][] = [];
  for (let i = 0; i < fields.length; i += 3) {
    rows.push(fields.slice(i, i + 3));
  }

  return (
    <div className="space-y-5">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
        >
          {row.map((f) => (
            <FieldCell key={f.key} label={f.label}>
              {f.value}
            </FieldCell>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface FormPreviewProps {
  config: StepFormConfig;
  values: Record<string, unknown>;
  action: "submit" | "draft";
  onBack: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  /** Called when user clicks Edit on a section — passes step index */
  onEdit?: (stepIndex: number) => void;
}

export function FormPreview({
  config,
  values,
  action,
  onBack,
  onConfirm,
  isLoading,
  onEdit,
}: FormPreviewProps) {
  return (
    <div>
      {/* Page title bar */}
      <div className="border-b border-border bg-white px-6 py-5">
        <h2 className="text-lg font-bold text-foreground">
          Review &amp; Confirmation
        </h2>
      </div>

      {/* Step sections */}
      <div className="bg-white px-6">
        <Accordion
          multiple
          defaultValue={config.steps.map((s) => s.id)}
          className="divide-y divide-border"
        >
          {config.steps.map((step, stepIndex) => {
            // ── All-attachment step: render as table ──────────────────────
            if (stepIsAllAttachments(step, values)) {
              const fileRows: {
                key: string;
                label: string;
                rawValue: unknown;
              }[] = [];

              for (const block of step.blocks) {
                if (!isBlockVisible(block, values)) continue;

                if (block.repeatable) {
                  const items = values[block.repeatable.arrayName];
                  if (!Array.isArray(items)) continue;
                  (items as Record<string, unknown>[]).forEach((item, idx) => {
                    for (const field of block.fields) {
                      const rawValue = item[field.name];
                      if (
                        rawValue === null ||
                        rawValue === undefined ||
                        rawValue === ""
                      )
                        continue;
                      fileRows.push({
                        key: `${field.name}-${idx}`,
                        label: field.label,
                        rawValue,
                      });
                    }
                  });
                } else {
                  for (const field of block.fields) {
                    if (!isFieldVisible(field, values)) continue;
                    const rawValue = values[field.name];
                    if (
                      rawValue === null ||
                      rawValue === undefined ||
                      rawValue === ""
                    )
                      continue;
                    fileRows.push({
                      key: field.name,
                      label: field.label,
                      rawValue,
                    });
                  }
                }
              }

              if (fileRows.length === 0) return null;

              return (
                <AccordionItem
                  key={step.id}
                  value={step.id}
                  className="border-none"
                >
                  <StepAccordionHeader
                    title={step.title}
                    stepIndex={stepIndex}
                    onEdit={onEdit}
                  />
                  <AccordionContent className="pb-0">
                    <div className="rounded-xl bg-[#fafafa] px-6 pt-6 pb-10">
                      <AttachmentTable rows={fileRows} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            }

            // ── Mixed step: file fields inline, rest in grid ──────────────
            const allGridFields: GridField[] = [];
            const blockSections: React.ReactNode[] = [];

            for (const block of step.blocks) {
              if (!isBlockVisible(block, values)) continue;

              // ── Repeatable block ────────────────────────────────────────
              if (block.repeatable) {
                const { arrayName } = block.repeatable;
                const items = values[arrayName];
                if (!Array.isArray(items) || items.length === 0) continue;

                items.forEach((item, idx) => {
                  const itemValues = item as Record<string, unknown>;
                  const gridFields: GridField[] = [];
                  for (const field of block.fields) {
                    const rawValue = itemValues[field.name];
                    if (
                      rawValue === null ||
                      rawValue === undefined ||
                      rawValue === ""
                    )
                      continue;
                    if (field.type === "file") {
                      gridFields.push({
                        key: `${field.name}-${idx}`,
                        label: field.label,
                        value: <InlineFileValue rawValue={rawValue} />,
                      });
                    } else {
                      gridFields.push({
                        key: `${field.name}-${idx}`,
                        label: field.label,
                        value: formatFieldValue(field, rawValue),
                      });
                    }
                  }
                  if (gridFields.length === 0) return;

                  blockSections.push(
                    <div
                      key={`${arrayName}-${idx}`}
                      className={cn(blockSections.length > 0 && "mt-6")}
                    >
                      {(block.title || idx > 0) && (
                        <p className="mb-4 text-base font-bold text-primary">
                          {block.title ?? arrayName} #{idx + 1}
                        </p>
                      )}
                      <FieldsGrid fields={gridFields} />
                    </div>,
                  );
                });
                continue;
              }

              // ── Normal block ─────────────────────────────────────────────
              const gridFields: GridField[] = [];
              for (const field of block.fields) {
                if (!isFieldVisible(field, values)) continue;
                const rawValue = values[field.name];
                if (
                  rawValue === null ||
                  rawValue === undefined ||
                  rawValue === ""
                )
                  continue;
                if (field.type === "file") {
                  gridFields.push({
                    key: field.name,
                    label: field.label,
                    value: <InlineFileValue rawValue={rawValue} />,
                  });
                } else {
                  gridFields.push({
                    key: field.name,
                    label: field.label,
                    value: formatFieldValue(field, rawValue),
                  });
                }
              }

              if (gridFields.length > 0) {
                if (block.title) {
                  blockSections.push(
                    <div
                      key={block.id}
                      className={cn(blockSections.length > 0 && "mt-6")}
                    >
                      <p className="mb-4 text-base font-bold text-primary">
                        {block.title}
                      </p>
                      <FieldsGrid fields={gridFields} />
                    </div>,
                  );
                } else {
                  allGridFields.push(...gridFields);
                }
              }
            }

            const hasContent =
              allGridFields.length > 0 || blockSections.length > 0;
            if (!hasContent) return null;

            return (
              <AccordionItem
                key={step.id}
                value={step.id}
                className="border-none"
              >
                <StepAccordionHeader
                  title={step.title}
                  stepIndex={stepIndex}
                  onEdit={onEdit}
                />
                <AccordionContent className="pb-0">
                  <div className="rounded-xl bg-[#fafafa] px-6 pt-6 pb-10">
                    {allGridFields.length > 0 && (
                      <div className={cn(blockSections.length > 0 && "mb-6")}>
                        <FieldsGrid fields={allGridFields} />
                      </div>
                    )}
                    {blockSections}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-t border-border bg-white px-6 py-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="h-auto rounded-[8px] border border-[#150004] bg-white px-6 py-3 text-base font-semibold capitalize text-[#150004] hover:bg-white hover:text-[#150004]"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="h-auto rounded-[8px] bg-primary px-6 py-3 text-base font-semibold capitalize text-white shadow-[0px_2px_4px_0px_rgba(165,0,34,0.08),0px_3px_6px_0px_rgba(165,0,34,0.2)] hover:bg-primary/90"
        >
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {action === "submit" ? "Confirm & Pay" : "Save Draft"}
        </Button>
      </div>
    </div>
  );
}
