// Form engine — public API
export { BlockRenderer } from "./BlockRenderer";
export { FieldRenderer } from "./FieldRenderer";
export { FormEngine } from "./FormEngine";
export type { FormEngineProps } from "./FormEngine";
export { FormPreview } from "./FormPreview";
export type { FormPreviewProps } from "./FormPreview";
export { useCondition } from "./hooks/useCondition";
export { useDynamicOptions } from "./hooks/useDynamicOptions";
// StepFormEngine is kept for backwards compatibility — it is FormEngine with mode="stepped"
export { StepFormEngine } from "./StepFormEngine";
export { StepIndicator } from "./StepIndicator";
export type {
  BlockConfig,
  BlockLayout,
  ConditionExpr,
  ConditionLeaf,
  ConditionNode,
  ConditionOperator,
  DynamicOptions,
  FieldConfig,
  FieldType,
  FieldValidation,
  FormConfig,
  NormalFormConfig,
  OptionsConfig,
  SelectOption,
  StaticOptions,
  StepConfig,
  StepFormConfig,
} from "./types";
export { buildDefaultValues, buildSchemaFromConfig } from "./utils/buildSchema";
export { evaluateCondition, getValueByPath } from "./utils/evaluateCondition";
export { getStepFieldNames } from "./utils/getStepFieldNames";
export { groupValuesByConfig } from "./utils/groupValuesByConfig";
