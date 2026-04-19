"use client";

import {
  flattenGroupedValues,
  FormEngine,
  groupValuesByConfig,
} from "@/form-engine";
import type { StepFormConfig } from "@/form-engine/types";
import {
  submitForm,
  updateSubmission,
  walkAndUploadFiles,
} from "@/lib/form-api";
import { useRouter } from "next/navigation";

interface FormClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
  editId?: string;
  initialValues?: Record<string, unknown>;
}

export function FormClient({ config, editId, initialValues }: FormClientProps) {
  const router = useRouter();

  const engineConfig = {
    mode: config.mode,
    submitLabel: config.submitLabel,
    steps: config.steps,
  } as unknown as StepFormConfig;

  async function handleSubmit(values: Record<string, unknown>) {
    const grouped = groupValuesByConfig(engineConfig, values);
    const uploadedPayload = await walkAndUploadFiles(grouped);

    if (editId) {
      await updateSubmission(editId, {
        rawPayload: uploadedPayload,
        status: "SUBMIT",
      });
    } else {
      await submitForm({
        serviceName: config.serviceName,
        stakeholderCode: config.stakeholderCode,
        rawPayload: uploadedPayload,
        status: "SUBMIT",
      });
    }

    router.push("/applications");
  }

  async function handleDraft(values: Record<string, unknown>) {
    const uploadedValues = await walkAndUploadFiles(values);

    if (editId) {
      await updateSubmission(editId, {
        rawPayload: uploadedValues,
        status: "DRAFT",
      });
    } else {
      await submitForm({
        serviceName: config.serviceName,
        stakeholderCode: config.stakeholderCode,
        rawPayload: uploadedValues,
        status: "DRAFT",
      });
    }

    router.push("/applications");
  }

  const flatInitialValues = initialValues
    ? flattenGroupedValues(initialValues)
    : undefined;

  return (
    <FormEngine
      config={engineConfig}
      onSubmit={handleSubmit}
      onDraft={handleDraft}
      sampleData={config.sampleData as Record<string, unknown> | undefined}
      defaultValues={flatInitialValues}
    />
  );
}
