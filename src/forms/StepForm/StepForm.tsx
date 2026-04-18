"use client";

import { StepFormEngine } from "@/form-engine";
import { stepFormConfig } from "./stepFormConfig";

export function StepForm() {
  function handleSubmit(values: Record<string, unknown>) {
    console.log("StepForm submitted:", values);
  }

  return <StepFormEngine config={stepFormConfig} onSubmit={handleSubmit} />;
}
