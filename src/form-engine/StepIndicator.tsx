"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Fragment } from "react";

type Step = {
  title: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number;
};

/**
 * Visual step progress bar for StepFormEngine.
 * Shows numbered pills: completed (✓), active (bold outline), upcoming (muted).
 */
export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Form steps" className="flex items-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <Fragment key={step.title}>
            <div className="flex flex-col items-center gap-1">
              <div
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive &&
                    "border-2 border-primary font-semibold text-primary",
                  !isCompleted &&
                    !isActive &&
                    "border-2 border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "max-w-16 text-center text-xs",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                aria-hidden="true"
                className={cn(
                  "mb-5 h-0.5 flex-1",
                  isCompleted ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
