import { describe, it, expect } from "vitest";
import { runEngine } from "./engine";
import type { RuleConfig } from "./types";

describe("runEngine", () => {
  it("returns empty array when no rules match", () => {
    const context = { riskTier: "LOW", aiMaturity: "none" };
    const rules: RuleConfig[] = [
      {
        ruleId: "R1",
        name: "High risk only",
        priority: 100,
        conditions: { all: [{ field: "riskTier", operator: "eq", value: "HIGH" }] },
        actions: { selectControls: ["CTL-001"], designation: "REQUIRED" },
      },
    ];
    const result = runEngine(context, rules);
    expect(result).toEqual([]);
  });

  it("returns control selections with ruleIds when rules match", () => {
    const context = { riskTier: "HIGH", aiMaturity: "production" };
    const rules: RuleConfig[] = [
      {
        ruleId: "RULE-P-001",
        name: "High risk",
        priority: 100,
        conditions: { all: [{ field: "riskTier", operator: "eq", value: "HIGH" }] },
        actions: { selectControls: ["CTL-A", "CTL-B"], designation: "REQUIRED" },
      },
      {
        ruleId: "RULE-P-002",
        name: "Production maturity",
        priority: 90,
        conditions: { all: [{ field: "aiMaturity", operator: "eq", value: "production" }] },
        actions: { selectControls: ["CTL-A", "CTL-C"], designation: "RECOMMENDED" },
      },
    ];
    const result = runEngine(context, rules);
    expect(result.length).toBeGreaterThan(0);

    const ctlA = result.find((s) => s.controlId === "CTL-A");
    expect(ctlA).toBeDefined();
    expect(ctlA!.designation).toBe("REQUIRED");
    expect(ctlA!.reasoning).toBeDefined();
    expect(ctlA!.reasoning!.length).toBeGreaterThanOrEqual(1);
    expect(ctlA!.ruleIds).toBeDefined();
    expect(ctlA!.ruleIds).toContain("RULE-P-001");
    expect(ctlA!.ruleIds).toContain("RULE-P-002");

    const ctlB = result.find((s) => s.controlId === "CTL-B");
    expect(ctlB?.ruleIds).toContain("RULE-P-001");

    const ctlC = result.find((s) => s.controlId === "CTL-C");
    expect(ctlC?.ruleIds).toContain("RULE-P-002");
  });

  it("upgrades designation when multiple rules select same control", () => {
    const context = { riskTier: "HIGH" };
    const rules: RuleConfig[] = [
      {
        ruleId: "R1",
        name: "Optional",
        priority: 100,
        conditions: { all: [{ field: "riskTier", operator: "eq", value: "HIGH" }] },
        actions: { selectControls: ["CTL-X"], designation: "OPTIONAL" },
      },
      {
        ruleId: "R2",
        name: "Required",
        priority: 90,
        conditions: { all: [{ field: "riskTier", operator: "eq", value: "HIGH" }] },
        actions: { selectControls: ["CTL-X"], designation: "REQUIRED" },
      },
    ];
    const result = runEngine(context, rules);
    const ctlX = result.find((s) => s.controlId === "CTL-X");
    expect(ctlX?.designation).toBe("REQUIRED");
    expect(ctlX?.ruleIds).toContain("R1");
    expect(ctlX?.ruleIds).toContain("R2");
  });
});
