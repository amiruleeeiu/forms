"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Step = {
  title: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav
      aria-label="Form steps"
      className="w-full"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;

        // Each connector half is filled when the step on the left side is completed.
        // Left-half of cell i: filled if step i-1 is completed → index <= currentStep
        // Right-half of cell i: filled if step i is completed → index < currentStep
        const leftLineFilled = !isFirst && index <= currentStep;
        const rightLineFilled = !isLast && isCompleted;

        return (
          <div key={step.title} className="relative flex flex-col items-center">
            {/* Connector — left half */}
            {!isFirst && (
              <div
                aria-hidden="true"
                className="absolute top-4.5 left-0 right-1/2 h-0.5 -translate-y-1/2"
              >
                <div
                  className={cn(
                    "h-full w-full",
                    leftLineFilled ? "bg-primary" : "bg-muted",
                  )}
                />
              </div>
            )}

            {/* Connector — right half */}
            {!isLast && (
              <div
                aria-hidden="true"
                className="absolute top-4.5 left-1/2 right-0 h-0.5 -translate-y-1/2"
              >
                <div
                  className={cn(
                    "h-full w-full",
                    rightLineFilled ? "bg-primary" : "bg-muted",
                  )}
                />
              </div>
            )}

            {/* Circle */}
            <div
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                isCompleted && "bg-primary text-primary-foreground shadow-sm",
                isActive &&
                  "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md",
                !isCompleted &&
                  !isActive &&
                  "border-2 border-muted-foreground/25 bg-background text-muted-foreground/60",
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                "mt-2 text-center text-xs leading-tight",
                isActive
                  ? "font-semibold text-primary"
                  : isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50",
              )}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
