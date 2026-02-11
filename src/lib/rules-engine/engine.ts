import { evaluateConditionGroup } from "./evaluator";
import {
  RuleConfig,
  AssessmentContext,
  ControlSelection,
} from "./types";

const DESIGNATION_PRIORITY: Record<string, number> = {
  REQUIRED: 3,
  RECOMMENDED: 2,
  OPTIONAL: 1,
};

export function runEngine(
  context: AssessmentContext,
  rules: RuleConfig[]
): ControlSelection[] {
  const selectionMap = new Map<string, ControlSelection>();

  const sortedRules = [...rules]
    .filter((r) => r.enabled !== false)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    if (!evaluateConditionGroup(rule.conditions, context)) continue;

    const { selectControls, designation, explanation } = rule.actions;
    const reason = explanation || rule.name;
    const ruleId = rule.ruleId;

    for (const controlId of selectControls) {
      const existing = selectionMap.get(controlId);

      if (!existing) {
        selectionMap.set(controlId, {
          controlId,
          designation,
          reasoning: [reason],
          ruleIds: [ruleId],
        });
      } else {
        existing.reasoning.push(reason);
        if (!existing.ruleIds.includes(ruleId)) existing.ruleIds.push(ruleId);
        if (
          DESIGNATION_PRIORITY[designation] >
          DESIGNATION_PRIORITY[existing.designation]
        ) {
          existing.designation = designation;
        }
      }
    }
  }

  return Array.from(selectionMap.values());
}
