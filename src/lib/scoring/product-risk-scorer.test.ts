import { describe, it, expect } from "vitest";
import { computeProductRiskScore } from "./product-risk-scorer";
import type { ProductAnswers } from "./types";

const baseOrgContext = {
  orgRiskTier: "LOW" as const,
  orgJurisdictions: [] as string[],
  orgRiskTolerance: {
    financial: 1,
    operational: 1,
    safetyWellbeing: 1,
    reputational: 1,
  },
};

describe("computeProductRiskScore", () => {
  it("returns LOW tier and score for minimal answers", () => {
    const answers: ProductAnswers = {};
    const result = computeProductRiskScore(answers, baseOrgContext);
    expect(result.tier).toBe("LOW");
    expect(result.score).toBeGreaterThanOrEqual(1);
    expect(result.drivers).toBeDefined();
    expect(Array.isArray(result.drivers)).toBe(true);
  });

  it("returns drivers with factor, contribution, and explanation", () => {
    const answers: ProductAnswers = {
      step4: { impactSeverity: "high", affectedPopulation: "large" },
      step3: { aiType: ["generative"] },
    };
    const result = computeProductRiskScore(answers, baseOrgContext);
    expect(result.drivers.length).toBeGreaterThan(0);
    for (const d of result.drivers) {
      expect(d).toHaveProperty("factor");
      expect(d).toHaveProperty("contribution");
      expect(d).toHaveProperty("explanation");
      expect(typeof d.factor).toBe("string");
      expect(typeof d.contribution).toBe("number");
      expect(typeof d.explanation).toBe("string");
    }
  });

  it("elevates tier with high impact and generative AI", () => {
    const answers: ProductAnswers = {
      step4: { impactSeverity: "critical", affectedPopulation: "large" },
      step3: { aiType: ["generative"], modelSource: "api" },
    };
    const result = computeProductRiskScore(answers, baseOrgContext);
    expect(["MEDIUM", "HIGH", "REGULATED"]).toContain(result.tier);
    const hasImpact = result.drivers.some((d) => d.factor === "impact_severity");
    const hasGenerative = result.drivers.some((d) => d.factor === "generative_ai");
    expect(hasImpact).toBe(true);
    expect(hasGenerative).toBe(true);
  });

  it("enforces org tier floor when org is HIGH", () => {
    const answers: ProductAnswers = {};
    const highOrgContext = { ...baseOrgContext, orgRiskTier: "HIGH" as const };
    const result = computeProductRiskScore(answers, highOrgContext);
    expect(result.tier).toBe("HIGH");
  });
});
