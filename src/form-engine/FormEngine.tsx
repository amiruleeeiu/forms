"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { type DefaultValues, type FieldValues, useForm } from "react-hook-form";
import type { ZodType } from "zod";
import { BlockRenderer } from "./BlockRenderer";
import type { NormalFormConfig } from "./types";
import { buildDefaultValues, buildSchemaFromConfig } from "./utils/buildSchema";

type FormEngineProps<TFieldValues extends FieldValues> = {
  config: NormalFormConfig;
  /** Optional — if omitted the schema is derived automatically from the config. */
  schema?: ZodType<TFieldValues>;
  /** Optional — if omitted sensible empty defaults are derived from the config. */
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
};

/**
 * Renders a normal (non-stepped) form from a NormalFormConfig.
 * Owns the useForm instance and wraps children in a FormProvider via <Form>.
 */
export function FormEngine<TFieldValues extends FieldValues>({
  config,
  schema,
  defaultValues,
  onSubmit,
}: FormEngineProps<TFieldValues>) {
  const resolvedSchema = (schema ??
    buildSchemaFromConfig(config)) as ZodType<TFieldValues>;
  const resolvedDefaults = (defaultValues ??
    buildDefaultValues(config)) as DefaultValues<TFieldValues>;

  const form = useForm<TFieldValues>({
    resolver: zodResolver(resolvedSchema),
    defaultValues: resolvedDefaults,
    mode: "onTouched",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(data))}
        className="space-y-6"
        noValidate
      >
        {config.blocks.map((block) => (
          <BlockRenderer key={block.id} config={block} />
        ))}

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {config.submitLabel ?? "Submit"}
          </Button>

          {config.resetLabel && (
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              {config.resetLabel}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
