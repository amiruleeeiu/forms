import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[46px] w-full rounded-[4px] border border-form-border bg-white px-[15px] py-[10px] text-base transition-colors outline-none placeholder:text-[#94a3b8] focus-visible:border-form-accent focus-visible:ring-1 focus-visible:ring-form-accent/20 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
