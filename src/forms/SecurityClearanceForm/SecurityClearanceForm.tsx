"use client";

import { StepFormEngine, groupValuesByConfig } from "@/form-engine";
import { securityClearanceFormConfig } from "./securityClearanceFormConfig";

export function SecurityClearanceForm() {
  function handleSubmit(values: Record<string, unknown>) {
    const grouped = groupValuesByConfig(securityClearanceFormConfig, values);
    console.log("SecurityClearanceForm submitted:", grouped);
  }

  return (
    <StepFormEngine
      config={securityClearanceFormConfig}
      onSubmit={handleSubmit}
    />
  );
}
