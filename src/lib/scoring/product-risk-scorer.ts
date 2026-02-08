import { ProductAnswers, RiskResult, RiskDriver, RiskTier } from "./types";

interface OrgContext {
  orgRiskTier: RiskTier;
  orgJurisdictions: string[];
  orgRiskTolerance: { financial: number; operational: number; safetyWellbeing: number; reputational: number };
}

const TIER_ORDER: Record<RiskTier, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, REGULATED: 4 };

function tierFromScore(score: number): RiskTier {
  if (score >= 19) return "REGULATED";
  if (score >= 13) return "HIGH";
  if (score >= 7) return "MEDIUM";
  return "LOW";
}

function enforceTierFloor(productTier: RiskTier, orgTier: RiskTier): RiskTier {
  return TIER_ORDER[productTier] >= TIER_ORDER[orgTier] ? productTier : orgTier;
}

export function computeProductRiskScore(answers: ProductAnswers, orgContext: OrgContext): RiskResult {
  const drivers: RiskDriver[] = [];
  let impactScore = 1;
  let likelihoodScore = 1;

  // Impact scoring
  const severityMap: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 5 };
  const severity = answers.step4?.impactSeverity || "medium";
  impactScore += severityMap[severity] || 2;

  if (severityMap[severity] >= 3) {
    drivers.push({ factor: "impact_severity", contribution: severityMap[severity], explanation: `Impact severity rated "${severity}" — ${severity === "critical" ? "potential for severe harm" : "significant negative consequences if system fails"}.` });
  }

  if (answers.step4?.canDenyServices) {
    impactScore += 1;
    drivers.push({ factor: "deny_services", contribution: 1, explanation: "System can deny services or opportunities to individuals, increasing stakes." });
  }

  const popMap: Record<string, number> = { small: 0, medium: 1, large: 2 };
  const popScore = popMap[answers.step4?.affectedPopulation || "small"] || 0;
  impactScore += popScore;
  if (popScore > 0) {
    drivers.push({ factor: "affected_population", contribution: popScore, explanation: `${answers.step4?.affectedPopulation} affected population increases potential impact scope.` });
  }

  impactScore = Math.min(5, impactScore);

  // Likelihood scoring
  const aiTypes = answers.step3?.aiType || [];
  if (aiTypes.includes("generative")) {
    likelihoodScore += 2;
    drivers.push({ factor: "generative_ai", contribution: 2, explanation: "Generative AI systems have higher risk of hallucination, prompt injection, and unexpected outputs." });
  }

  if (answers.step3?.modelSource === "api" || answers.step3?.modelSource === "buy") {
    likelihoodScore += 1;
    drivers.push({ factor: "external_model", contribution: 1, explanation: "Using external/third-party models introduces supply chain and version control risks." });
  }

  if (answers.step7?.promptInjectionExposure) {
    likelihoodScore += 1;
    drivers.push({ factor: "prompt_injection", contribution: 1, explanation: "System is exposed to prompt injection attacks." });
  }

  const hallucinationMap: Record<string, number> = { low: 0, medium: 1, high: 2 };
  const hallScore = hallucinationMap[answers.step7?.hallucinationRisk || "low"] || 0;
  if (hallScore > 0) {
    likelihoodScore += hallScore;
    drivers.push({ factor: "hallucination_risk", contribution: hallScore, explanation: `${answers.step7?.hallucinationRisk} hallucination risk increases likelihood of incorrect outputs.` });
  }

  const biasCategories = answers.step7?.biasRiskCategories?.length || 0;
  if (biasCategories > 0) {
    const biasScore = Math.min(2, Math.ceil(biasCategories / 2));
    likelihoodScore += biasScore;
    drivers.push({ factor: "bias_risk", contribution: biasScore, explanation: `${biasCategories} bias risk ${biasCategories === 1 ? "category" : "categories"} identified (${answers.step7?.biasRiskCategories?.join(", ")}).` });
  }

  likelihoodScore = Math.min(5, likelihoodScore);

  // Existing controls adjustment
  let controlsAdjustment = 0;
  const controls = answers.step9;
  if (controls?.testingPlan) controlsAdjustment--;
  if (controls?.monitoring) controlsAdjustment--;
  if (controls?.documentation) controlsAdjustment--;
  if (controls?.accessControls) controlsAdjustment--;
  if (controls?.humanReview) controlsAdjustment--;
  if (controls?.incidentResponse) controlsAdjustment--;

  if (controlsAdjustment < 0) {
    drivers.push({ factor: "existing_controls", contribution: controlsAdjustment, explanation: `${Math.abs(controlsAdjustment)} existing control${Math.abs(controlsAdjustment) > 1 ? "s" : ""} reduce risk exposure.` });
  }

  // Regulatory boost
  let regulatoryBoost = 0;
  const dataTypes = answers.step5?.dataTypes || [];
  const euCountries = ["EU", "Germany", "France", "Italy", "Spain", "Netherlands"];
  const hasEU = orgContext.orgJurisdictions.some((c) => euCountries.includes(c));

  if (dataTypes.includes("PHI")) {
    regulatoryBoost += 1;
    drivers.push({ factor: "phi_regulatory", contribution: 1, explanation: "Processing PHI triggers HIPAA compliance requirements." });
  }

  if (hasEU && answers.step4?.endUsers !== "employees") {
    regulatoryBoost += 1;
    drivers.push({ factor: "eu_ai_act", contribution: 1, explanation: "EU jurisdiction with external-facing AI may trigger EU AI Act requirements." });
  }

  const inherentRisk = impactScore * likelihoodScore;
  const finalScore = Math.max(1, Math.min(25, inherentRisk + controlsAdjustment + regulatoryBoost));
  let tier = tierFromScore(finalScore);
  tier = enforceTierFloor(tier, orgContext.orgRiskTier);

  if (tier !== tierFromScore(finalScore)) {
    drivers.push({ factor: "org_floor", contribution: 0, explanation: `Product risk tier elevated to ${tier} to match organizational risk floor.` });
  }

  return { score: finalScore, tier, drivers };
}
