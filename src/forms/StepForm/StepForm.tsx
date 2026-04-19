"use client";

import { FormEngine } from "@/form-engine";
import { stepFormConfig } from "./stepFormConfig";

export function StepForm() {
  function handleSubmit(values: Record<string, unknown>) {
    console.log("StepForm submitted:", values);
  }

  return <FormEngine config={stepFormConfig} onSubmit={handleSubmit} />;
}
