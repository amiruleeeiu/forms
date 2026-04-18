"use client";

import { FormEngine } from "@/form-engine";
import { conditionalFormConfig } from "./conditionalFormConfig";

export function ConditionalForm() {
  function handleSubmit(values: Record<string, unknown>) {
    console.log("ConditionalForm submitted:", values);
  }

  return <FormEngine config={conditionalFormConfig} onSubmit={handleSubmit} />;
}
