"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { type DefaultValues, type FieldValues, useForm } from "react-hook-form";
import type { ZodType } from "zod";
import { BlockRenderer } from "./BlockRenderer";
import { StepIndicator } from "./StepIndicator";
import type { StepFormConfig } from "./types";
import { buildDefaultValues, buildSchemaFromConfig } from "./utils/buildSchema";
import { getStepFieldNames } from "./utils/getStepFieldNames";

type StepFormEngineProps<TFieldValues extends FieldValues> = {
  config: StepFormConfig;
  /** Optional — if omitted the schema is derived automatically from the config. */
  schema?: ZodType<TFieldValues>;
  /** Optional — if omitted sensible empty defaults are derived from the config. */
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
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
}: StepFormEngineProps<TFieldValues>) {
  const [currentStep, setCurrentStep] = useState(0);
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
    const fieldNames = getStepFieldNames(steps[currentStep]);
    const valid = await form.trigger(fieldNames as never[]);
    if (valid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // trigger() validates but doesn't mark fields as touched, so RHF's
      // reValidateMode:onChange won't fire for untouched fields. Touch them
      // now so typing a correction immediately clears the error.
      for (const name of fieldNames) {
        form.setValue(name as never, form.getValues(name as never), {
          shouldTouch: true,
          shouldDirty: false,
          shouldValidate: false,
        });
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const activeStep = steps[currentStep];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(data))}
        className="space-y-6"
        noValidate
      >
        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{activeStep.title}</h2>
          {activeStep.description && (
            <p className="text-sm text-muted-foreground">
              {activeStep.description}
            </p>
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
