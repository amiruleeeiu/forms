"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { type DefaultValues, type FieldValues, useForm } from "react-hook-form";
import type { ZodType } from "zod";
import { BlockRenderer } from "./BlockRenderer";
import { FormPreview } from "./FormPreview";
import { StepIndicator } from "./StepIndicator";
import type { FormConfig } from "./types";
import { buildDefaultValues, buildSchemaFromConfig } from "./utils/buildSchema";
import { getStepDevData } from "./utils/getStepDevData";
import { getVisibleRequiredErrors } from "./utils/getVisibleRequiredErrors";
import { getVisibleStepFieldNames } from "./utils/getVisibleStepFieldNames";

export type FormEngineProps<TFieldValues extends FieldValues> = {
  config: FormConfig;
  /** Optional — if omitted the schema is derived automatically from the config. */
  schema?: ZodType<TFieldValues>;
  /** Optional — if omitted sensible empty defaults are derived from the config. */
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  /**
   * Optional — called with current values (no validation) when user clicks Draft.
   * Only shown for stepped forms.
   */
  onDraft?: (values: TFieldValues) => void | Promise<void>;
  /**
   * Optional flat field-name→value map used by the dev Import button.
   * Only used for stepped forms.
   */
  sampleData?: Record<string, unknown>;
};

/**
 * Universal form engine — renders either a normal single-page form or a
 * multi-step form depending on `config.mode`.
 *
 * - `mode: "normal"` — all blocks on one page, submit button at the bottom.
 * - `mode: "stepped"` — step-by-step with validation per step, preview before submit.
 */
export function FormEngine<TFieldValues extends FieldValues>({
  config,
  schema,
  defaultValues,
  onSubmit,
  onDraft,
  sampleData,
}: FormEngineProps<TFieldValues>) {
  // ── Stepped-only state ───────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [preview, setPreview] = useState<{
    action: "submit" | "draft";
    values: Record<string, unknown>;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isStepped = config.mode === "stepped";
  const steps = isStepped ? config.steps : [];
  const isLastStep = isStepped && currentStep === steps.length - 1;

  // ── Form setup ───────────────────────────────────────────────────────────
  const resolvedSchema = (schema ??
    buildSchemaFromConfig(config)) as ZodType<TFieldValues>;
  const resolvedDefaults = (defaultValues ??
    buildDefaultValues(config)) as DefaultValues<TFieldValues>;

  const form = useForm<TFieldValues>({
    resolver: zodResolver(resolvedSchema as never),
    defaultValues: resolvedDefaults,
    mode: "onTouched",
  });

  // ── Stepped handlers ─────────────────────────────────────────────────────
  const handleNext = async () => {
    const values = form.getValues() as Record<string, unknown>;
    const visibleFieldNames = getVisibleStepFieldNames(
      steps[currentStep],
      values,
    );
    const zodValid = await form.trigger(visibleFieldNames as never[]);
    const manualErrors = getVisibleRequiredErrors(steps[currentStep], values);
    for (const err of manualErrors) {
      form.setError(err.name as never, {
        type: "required",
        message: err.message,
      });
    }
    if (zodValid && manualErrors.length === 0) {
      form.reset(form.getValues());
      setCurrentStep((prev) => prev + 1);
    } else {
      for (const name of visibleFieldNames) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setValue(name as any, form.getValues(name as any), {
          shouldTouch: true,
          shouldDirty: false,
          shouldValidate: false,
        });
      }
      requestAnimationFrame(() => {
        const firstError = formRef.current?.querySelector(
          '[aria-invalid="true"]',
        );
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleDraft = () => {
    setPreview({
      action: "draft",
      values: form.getValues() as Record<string, unknown>,
    });
  };

  const handleSubmitPreview = async () => {
    const values = form.getValues() as Record<string, unknown>;
    const visibleFieldNames = getVisibleStepFieldNames(
      steps[currentStep],
      values,
    );
    const zodValid = await form.trigger(visibleFieldNames as never[]);
    const manualErrors = getVisibleRequiredErrors(steps[currentStep], values);
    for (const err of manualErrors) {
      form.setError(err.name as never, {
        type: "required",
        message: err.message,
      });
    }
    if (zodValid && manualErrors.length === 0) {
      setPreview({ action: "submit", values });
    } else {
      for (const name of visibleFieldNames) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setValue(name as any, form.getValues(name as any), {
          shouldTouch: true,
          shouldDirty: false,
          shouldValidate: false,
        });
      }
      requestAnimationFrame(() => {
        const firstError = formRef.current?.querySelector(
          '[aria-invalid="true"]',
        );
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setIsConfirming(true);
    try {
      if (preview.action === "submit") {
        await onSubmit(preview.values as TFieldValues);
      } else {
        await onDraft?.(preview.values as TFieldValues);
      }
    } finally {
      setIsConfirming(false);
      setPreview(null);
    }
  };

  const importDevData = () => {
    if (sampleData) {
      form.reset({
        ...resolvedDefaults,
        ...sampleData,
      } as DefaultValues<TFieldValues>);
    } else if (isStepped) {
      const sample = getStepDevData(steps[currentStep]);
      for (const [key, value] of Object.entries(sample)) {
        form.setValue(key as never, value as never, { shouldDirty: true });
      }
    }
  };

  // ── Preview screen (stepped only) ────────────────────────────────────────
  if (isStepped && preview) {
    return (
      <FormPreview
        config={config}
        values={preview.values}
        action={preview.action}
        onBack={() => setPreview(null)}
        onConfirm={handleConfirm}
        isLoading={isConfirming}
        onEdit={(stepIndex) => {
          setPreview(null);
          setCurrentStep(stepIndex);
        }}
      />
    );
  }

  // ── Normal (single-page) form ─────────────────────────────────────────────
  if (!isStepped) {
    const normalConfig = config;
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => onSubmit(data as TFieldValues))}
          className="space-y-6"
          noValidate
        >
          {normalConfig.blocks.map((block) => (
            <BlockRenderer key={block.id} config={block} />
          ))}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-auto rounded-[8px] px-6 py-3 text-base font-semibold capitalize shadow-[0px_2px_4px_0px_rgba(165,0,34,0.08),0px_3px_6px_0px_rgba(165,0,34,0.2)]"
            >
              {form.formState.isSubmitting && (
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {normalConfig.submitLabel ?? "Submit"}
            </Button>
            {normalConfig.resetLabel && (
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="h-auto rounded-[8px] border-[#150004] bg-white px-6 py-3 text-base font-semibold capitalize text-[#150004] hover:bg-white hover:text-[#150004]"
              >
                {normalConfig.resetLabel}
              </Button>
            )}
          </div>
        </form>
      </Form>
    );
  }

  // ── Stepped form ──────────────────────────────────────────────────────────
  const activeStep = steps[currentStep];

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
        noValidate
      >
        {/* Step tab bar — full-width at top, no padding */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* White card content area */}
        <div className="bg-white px-6 pt-6 pb-8 space-y-6 min-h-100">
          <div className="flex items-center justify-end">
            {activeStep.description && (
              <p className="text-sm text-muted-foreground">
                {activeStep.description}
              </p>
            )}
            {process.env.NODE_ENV === "development" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={importDevData}
                className="ml-auto shrink-0 border-dashed border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
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

          <div className="flex items-center justify-between border-t border-border pt-6 mt-2">
            <div>
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="h-auto rounded-[8px] border-[#150004] bg-white px-6 py-3 text-base font-semibold capitalize text-[#150004] hover:bg-white hover:text-[#150004]"
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {onDraft && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDraft}
                  className="h-auto rounded-[8px] border-[#150004] bg-white px-6 py-3 text-base font-semibold capitalize text-[#150004] hover:bg-white hover:text-[#150004]"
                >
                  Save as Draft
                </Button>
              )}
              {isLastStep ? (
                <Button
                  type="button"
                  onClick={handleSubmitPreview}
                  disabled={form.formState.isSubmitting}
                  className="h-auto rounded-[8px] px-6 py-3 text-base font-semibold capitalize shadow-[0px_2px_4px_0px_rgba(165,0,34,0.08),0px_3px_6px_0px_rgba(165,0,34,0.2)]"
                >
                  {config.submitLabel ?? "Submit"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-auto rounded-[8px] px-6 py-3 text-base font-semibold capitalize shadow-[0px_2px_4px_0px_rgba(165,0,34,0.08),0px_3px_6px_0px_rgba(165,0,34,0.2)]"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
