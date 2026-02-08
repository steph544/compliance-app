import { Condition, ConditionGroup, AssessmentContext } from "./types";

function getNestedValue(obj: AssessmentContext, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function evaluateCondition(
  condition: Condition,
  context: AssessmentContext
): boolean {
  const fieldValue = getNestedValue(context, condition.field);

  switch (condition.operator) {
    case "eq":
      return fieldValue === condition.value;

    case "neq":
      return fieldValue !== condition.value;

    case "in":
      if (!Array.isArray(condition.value)) return false;
      return condition.value.includes(fieldValue);

    case "contains":
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value);
      }
      if (typeof fieldValue === "string" && typeof condition.value === "string") {
        return fieldValue.includes(condition.value);
      }
      return false;

    case "gte":
      return typeof fieldValue === "number" && typeof condition.value === "number"
        ? fieldValue >= condition.value
        : false;

    case "lte":
      return typeof fieldValue === "number" && typeof condition.value === "number"
        ? fieldValue <= condition.value
        : false;

    case "exists":
      if (Array.isArray(fieldValue)) {
        return fieldValue.length > 0;
      }
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== false;

    case "not_exists":
      if (Array.isArray(fieldValue)) {
        return fieldValue.length === 0;
      }
      return fieldValue === undefined || fieldValue === null || fieldValue === false;

    default:
      return false;
  }
}

export function evaluateConditionGroup(
  group: ConditionGroup,
  context: AssessmentContext
): boolean {
  if (group.all) {
    return group.all.every((condition) => evaluateCondition(condition, context));
  }
  if (group.any) {
    return group.any.some((condition) => evaluateCondition(condition, context));
  }
  return false;
}
