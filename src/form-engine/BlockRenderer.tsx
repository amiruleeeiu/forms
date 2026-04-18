"use client";

import { cn } from "@/lib/utils";
import { FieldRenderer } from "./FieldRenderer";
import { useCondition } from "./hooks/useCondition";
import type { BlockConfig, BlockLayout } from "./types";

const LAYOUT_CLASS: Record<BlockLayout, string> = {
  single: "",
  "2-col": "grid grid-cols-1 gap-4 md:grid-cols-2",
  "3-col": "grid grid-cols-1 gap-4 md:grid-cols-3",
};

type BlockRendererProps = {
  config: BlockConfig;
};

/**
 * Renders a block (card) containing a title, description, and a grid of fields.
 * Evaluates showWhen / hideWhen to conditionally render the entire block.
 */
export function BlockRenderer({ config }: BlockRendererProps) {
  const shouldShow = useCondition(config.showWhen); // default true  → show when no condition
  const shouldHide = useCondition(config.hideWhen, false); // default false → don't hide when no condition

  if (shouldHide || !shouldShow) return null;

  const layout = config.layout ?? "single";
  const gridClass = LAYOUT_CLASS[layout];

  return (
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
  );
}
