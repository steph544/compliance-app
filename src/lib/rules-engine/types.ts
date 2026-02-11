export interface Condition {
  field: string;
  operator: "eq" | "neq" | "in" | "contains" | "gte" | "lte" | "exists" | "not_exists";
  value: unknown;
}

export interface ConditionGroup {
  all?: Condition[];
  any?: Condition[];
}

export interface RuleActions {
  selectControls: string[];
  designation: "REQUIRED" | "RECOMMENDED" | "OPTIONAL";
  explanation?: string;
  policyFlags?: string[];
}

export interface RuleConfig {
  ruleId: string;
  name: string;
  description?: string;
  priority: number;
  conditions: ConditionGroup;
  actions: RuleActions;
  enabled?: boolean;
}

export interface ControlSelection {
  controlId: string;
  designation: "REQUIRED" | "RECOMMENDED" | "OPTIONAL";
  reasoning: string[];
  /** Rule IDs that selected this control (for traceability). */
  ruleIds: string[];
}

export type AssessmentContext = Record<string, unknown>;

export type ControlScope = "ORG" | "PRODUCT" | "BOTH";
