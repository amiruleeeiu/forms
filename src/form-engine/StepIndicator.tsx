"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

type Step = {
  title: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Form steps" className="flex w-full flex-wrap bg-white">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.title}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "relative flex flex-1 basis-[160px] items-center justify-between pl-5 pr-3 py-[18px] border-b-[1.5px] transition-colors",
              isActive || isCompleted ? "border-primary" : "border-border",
            )}
          >
            <div className="flex flex-col gap-1.5 min-w-0">
              <p
                className={cn(
                  "text-[11px] uppercase tracking-[0.08em] leading-none font-['DM_Sans',sans-serif]",
                  isActive || isCompleted
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {`STEP ${index + 1}`}
              </p>
              <p
                className={cn(
                  "text-base leading-snug truncate font-['DM_Sans',sans-serif]",
                  isActive
                    ? "font-medium text-foreground"
                    : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.title}
              </p>
            </div>

            {/* Completed checkmark / chevron separator */}
            {isCompleted && !isLast ? (
              <Check
                aria-hidden="true"
                className="size-4 shrink-0 text-primary ml-2"
              />
            ) : !isLast ? (
              <ChevronRight
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground ml-2"
              />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
