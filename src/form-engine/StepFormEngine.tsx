"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { type DefaultValues, type FieldValues, useForm } from "react-hook-form";
import type { ZodType } from "zod";
import { BlockRenderer } from "./BlockRenderer";
import { StepIndicator } from "./StepIndicator";
import type { StepFormConfig } from "./types";
import { buildDefaultValues, buildSchemaFromConfig } from "./utils/buildSchema";
import { getStepDevData } from "./utils/getStepDevData";
import { getVisibleRequiredErrors } from "./utils/getVisibleRequiredErrors";
import { getVisibleStepFieldNames } from "./utils/getVisibleStepFieldNames";

type StepFormEngineProps<TFieldValues extends FieldValues> = {
  config: StepFormConfig;
  /** Optional — if omitted the schema is derived automatically from the config. */
  schema?: ZodType<TFieldValues>;
  /** Optional — if omitted sensible empty defaults are derived from the config. */
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  /** Optional — called with current values (no validation) when user clicks Draft. */
  onDraft?: (values: TFieldValues) => void | Promise<void>;
  /**
   * Optional flat field-name→value map used by the dev Import button.
   * When provided, clicking Import fills ALL steps at once via form.reset.
   * Keys that match registered field names are applied; others are ignored.
   */
  sampleData?: Record<string, unknown>;
};

/**
 * Renders a multi-step form from a StepFormConfig.
 * - Validates only the current step's fields before advancing.
 * - Shows a StepIndicator for progress.
 * - Submit button only appears on the final step.
 */
export function StepFormEngine<TFieldValues extends FieldValues>({
  config,
  schema,
  defaultValues,
  onSubmit,
  onDraft,
  sampleData,
}: StepFormEngineProps<TFieldValues>) {
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const steps = config.steps;
  const isLastStep = currentStep === steps.length - 1;

  const resolvedSchema = (schema ??
    buildSchemaFromConfig(config)) as ZodType<TFieldValues>;
  const resolvedDefaults = (defaultValues ??
    buildDefaultValues(config)) as DefaultValues<TFieldValues>;

  const form = useForm<TFieldValues>({
    resolver: zodResolver(resolvedSchema),
    defaultValues: resolvedDefaults,
    mode: "onTouched",
  });

  const handleNext = async () => {
    const values = form.getValues() as Record<string, unknown>;
    const visibleFieldNames = getVisibleStepFieldNames(
      steps[currentStep],
      values,
    );
    const zodValid = await form.trigger(visibleFieldNames as never[]);

    // Zod marks conditional-block fields as optional to avoid blocking when
    // hidden. Manually enforce required validation for visible empty fields.
    const manualErrors = getVisibleRequiredErrors(steps[currentStep], values);
    for (const err of manualErrors) {
      form.setError(err.name as never, {
        type: "required",
        message: err.message,
      });
    }

    if (zodValid && manualErrors.length === 0) {
      // Reset all form state (errors, touched, dirty) while keeping current
      // values. This prevents the zodResolver—which runs against the full
      // schema during trigger()—from leaking stale errors onto the next
      // step's fields the moment they mount and register themselves.
      form.reset(form.getValues());
      setCurrentStep((prev) => prev + 1);
    } else {
      // Touch all visible fields so RHF's reValidateMode:onChange fires.
      for (const name of visibleFieldNames) {
        form.setValue(name as never, form.getValues(name as never), {
          shouldTouch: true,
          shouldDirty: false,
          shouldValidate: false,
        });
      }
      // Scroll to the first error field after React flushes the DOM update.
      requestAnimationFrame(() => {
        const firstError = formRef.current?.querySelector(
          '[aria-invalid="true"]',
        );
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleDraft = () => {
    onDraft?.(form.getValues());
  };

  const importDevData = () => {
    if (sampleData) {
      // Fill all steps at once by merging sample data over defaults.
      form.reset({ ...resolvedDefaults, ...sampleData } as DefaultValues<TFieldValues>);
    } else {
      const sample = getStepDevData(activeStep);
      for (const [key, value] of Object.entries(sample)) {
        form.setValue(key as never, value as never, { shouldDirty: true });
      }
    }
  };

  const activeStep = steps[currentStep];

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit((data) => onSubmit(data))}
        onKeyDown={(e) => {
          // Prevent Enter in input fields from triggering implicit form
          // submission, which would run zodResolver on all fields and
          // pre-populate errors for steps not yet visited.
          if (
            e.key === "Enter" &&
            e.target instanceof HTMLInputElement
          ) {
            e.preventDefault();
          }
        }}
        className="space-y-6"
        noValidate
      >
        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{activeStep.title}</h2>
            {activeStep.description && (
              <p className="text-sm text-muted-foreground">
                {activeStep.description}
              </p>
            )}
          </div>

          {process.env.NODE_ENV === "development" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={importDevData}
              className="shrink-0 border-dashed border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
              title="Dev: fill this step with sample data"
            >
              Import
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {activeStep.blocks.map((block) => (
            <BlockRenderer key={block.id} config={block} />
          ))}
        </div>

        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}

          {onDraft && (
            <Button type="button" variant="outline" onClick={handleDraft}>
              Draft
            </Button>
          )}

          {isLastStep ? (
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {config.submitLabel ?? "Submit"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
