"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { FieldRenderer } from "./FieldRenderer";
import { useCondition } from "./hooks/useCondition";
import type { BlockConfig, BlockLayout, FieldConfig } from "./types";

const LAYOUT_CLASS: Record<BlockLayout, string> = {
  single: "",
  "2-col": "grid grid-cols-1 gap-4 md:grid-cols-2",
  "3-col": "grid grid-cols-1 gap-4 md:grid-cols-3",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFieldDefault(field: FieldConfig): unknown {
  switch (field.type) {
    case "checkbox":
      return false;
    case "checkbox-group":
      return [];
    case "file":
      return null;
    case "number":
    case "date":
      return undefined;
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// ResetWatcher — stays mounted even when its parent block is hidden.
// When any field listed in `resetOn` changes value, resets all `fields`
// in the block to their defaults (cascade / dependent field reset).
// ---------------------------------------------------------------------------

type ResetWatcherProps = {
  fields: FieldConfig[];
  resetOn: string[];
};

function ResetWatcher({ fields, resetOn }: ResetWatcherProps) {
  const { setValue } = useFormContext();
  const watched = useWatch({ name: resetOn }) as unknown[];

  // Stringify for stable comparison (avoids new-array-reference false-positives)
  const watchedStr = JSON.stringify(watched);
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip the very first run (mount) — only react to subsequent changes.
    if (prevRef.current === null) {
      prevRef.current = watchedStr;
      return;
    }
    if (watchedStr !== prevRef.current) {
      prevRef.current = watchedStr;
      for (const field of fields) {
        setValue(field.name as never, getFieldDefault(field) as never);
      }
    }
    // watchedStr is a stable string dep; setValue and fields are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedStr]);

  return null;
}

// ---------------------------------------------------------------------------
// RepeatableBlockRenderer
// ---------------------------------------------------------------------------

/**
 * Renders a repeatable block using react-hook-form's useFieldArray.
 * Each entry gets its own set of fields with prefixed names
 * (`{arrayName}.{index}.{fieldName}`).
 */
function RepeatableBlockRenderer({ config }: BlockRendererProps) {
  const { repeatable } = config;
  if (!repeatable) return null;

  const { arrayName, minItems = 0, addLabel = "+ Add Another" } = repeatable;
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: arrayName,
  });

  const layout = config.layout ?? "single";
  const gridClass = LAYOUT_CLASS[layout];

  function getItemDefault(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const field of config.fields) {
      obj[field.name] = getFieldDefault(field);
    }
    return obj;
  }

  return (
    <div className="space-y-3">
      {(config.title || config.description) && (
        <div className="space-y-1">
          {config.title && (
            <h3 className="text-base font-semibold leading-none tracking-tight">
              {config.title}
            </h3>
          )}
          {config.description && (
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          )}
        </div>
      )}

      {fields.map((item, index) => (
        <div key={item.id} className="rounded-lg border p-4 space-y-4">
          <div className={cn(gridClass || "space-y-4")}>
            {config.fields.map((field) => {
              const prefixedConfig = {
                ...field,
                name: `${arrayName}.${index}.${field.name}`,
              };
              return <FieldRenderer key={field.name} config={prefixedConfig} />;
            })}
          </div>

          {fields.length > minItems && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(getItemDefault())}
      >
        {addLabel}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BlockRenderer
// ---------------------------------------------------------------------------

type BlockRendererProps = {
  config: BlockConfig;
};

/**
 * Renders a block (card) containing a title, description, and a grid of fields.
 * Evaluates showWhen / hideWhen to conditionally render the entire block.
 *
 * When `resetOn` is configured, a ResetWatcher is always kept mounted (even
 * when the block is hidden) so cascade resets fire regardless of visibility.
 */
export function BlockRenderer({ config }: BlockRendererProps) {
  const shouldShow = useCondition(config.showWhen); // default true  → show when no condition
  const shouldHide = useCondition(config.hideWhen, false); // default false → don't hide when no condition

  const watcher = config.resetOn?.length ? (
    <ResetWatcher fields={config.fields} resetOn={config.resetOn} />
  ) : null;

  if (shouldHide || !shouldShow) {
    // Keep the watcher alive even when the block is hidden.
    return watcher;
  }

  // Delegate repeatable blocks to the specialized renderer.
  if (config.repeatable) {
    return <RepeatableBlockRenderer config={config} />;
  }

  const layout = config.layout ?? "single";
  const gridClass = LAYOUT_CLASS[layout];

  return (
    <>
      {/* ResetWatcher is always at position-0 so React never unmounts it on visibility toggle */}
      {watcher}
      <div className="space-y-4 rounded-lg border p-4">
        {(config.title || config.description) && (
          <div className="space-y-1">
            {config.title && (
              <h3 className="text-base font-semibold leading-none tracking-tight">
                {config.title}
              </h3>
            )}
            {config.description && (
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            )}
          </div>
        )}

        <div className={cn(gridClass || "space-y-4")}>
          {config.fields.map((field) => (
            <FieldRenderer key={field.name} config={field} />
          ))}
        </div>
      </div>
    </>
  );
}
