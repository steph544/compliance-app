import { OrgAnswers, RiskResult, RiskDriver, RiskTier } from "./types";

function computeImpactScore(answers: OrgAnswers): { score: number; drivers: RiskDriver[] } {
  const drivers: RiskDriver[] = [];
  const step4 = answers.step4;
  if (!step4) return { score: 3, drivers: [{ factor: "risk_tolerance", contribution: 3, explanation: "No risk tolerance data provided; defaulting to medium." }] };

  // Invert tolerance sliders: low tolerance (1) = high impact concern (5)
  const sliders = [step4.financial, step4.operational, step4.safetyWellbeing, step4.reputational];
  const avgTolerance = sliders.reduce((a, b) => a + b, 0) / sliders.length;
  const impactScore = Math.round(6 - avgTolerance); // Invert: 1→5, 5→1

  if (step4.safetyWellbeing <= 2) {
    drivers.push({ factor: "safety_sensitivity", contribution: 1, explanation: "Low safety/wellbeing tolerance indicates high potential impact on people." });
  }
  if (step4.reputational <= 2) {
    drivers.push({ factor: "reputational_risk", contribution: 1, explanation: "Low reputational risk tolerance signals brand-sensitive AI usage." });
  }

  drivers.push({
    factor: "overall_impact",
    contribution: impactScore,
    explanation: `Average risk tolerance of ${avgTolerance.toFixed(1)}/5 translates to impact score of ${impactScore}/5.`,
  });

  return { score: Math.max(1, Math.min(5, impactScore)), drivers };
}

function computeLikelihoodScore(answers: OrgAnswers): { score: number; drivers: RiskDriver[] } {
  const drivers: RiskDriver[] = [];
  let score = 1;

  // AI maturity
  const maturity = answers.step3?.maturityStage;
  const maturityScores: Record<string, number> = { none: 1, pilots: 2, production: 3, enterprise: 4 };
  const maturityScore = maturityScores[maturity || "none"] || 1;
  score += maturityScore - 1;
  if (maturityScore >= 3) {
    drivers.push({ factor: "ai_maturity", contribution: maturityScore - 1, explanation: `AI maturity at "${maturity}" level increases likelihood of risk events at scale.` });
  }

  // Data sensitivity
  const data = answers.step5;
  let dataSensitivity = 0;
  if (data?.pii) dataSensitivity++;
  if (data?.phi) dataSensitivity += 2;
  if (data?.pci) dataSensitivity++;
  if (data?.biometric) dataSensitivity += 2;
  if (data?.childrenData) dataSensitivity += 2;
  const dataScore = Math.min(3, Math.ceil(dataSensitivity / 2));
  score += dataScore;
  if (dataScore > 0) {
    const types = [];
    if (data?.pii) types.push("PII");
    if (data?.phi) types.push("PHI");
    if (data?.pci) types.push("PCI");
    if (data?.biometric) types.push("biometric");
    if (data?.childrenData) types.push("children's data");
    drivers.push({ factor: "data_sensitivity", contribution: dataScore, explanation: `Processing ${types.join(", ")} increases data breach and regulatory risk.` });
  }

  // AI usage scope
  const usage = answers.step6?.aiUsage || [];
  if (usage.includes("automated_decisions")) {
    score += 2;
    drivers.push({ factor: "automated_decisions", contribution: 2, explanation: "Automated decision-making significantly increases risk of harm from errors or bias." });
  } else if (usage.includes("customer_facing")) {
    score += 1;
    drivers.push({ factor: "customer_facing", contribution: 1, explanation: "Customer-facing AI increases exposure to quality and safety risks." });
  }

  return { score: Math.max(1, Math.min(5, score)), drivers };
}

function computeGovernanceAdjustment(answers: OrgAnswers): { adjustment: number; drivers: RiskDriver[] } {
  const drivers: RiskDriver[] = [];
  let adjustment = 0;
  const gov = answers.step8;

  if (gov?.securityProgram) adjustment--;
  if (gov?.privacyProgram) adjustment--;
  if (gov?.modelInventory) adjustment--;
  if (gov?.incidentResponse) adjustment--;
  if (gov?.sdlcControls) adjustment--;

  const engagement = answers.step9;
  if (engagement?.impactAssessments === "systematic") adjustment--;
  if (engagement?.recourseMechanisms) adjustment--;

  if (adjustment < 0) {
    const count = Math.abs(adjustment);
    drivers.push({
      factor: "existing_governance",
      contribution: adjustment,
      explanation: `${count} existing governance element${count > 1 ? "s" : ""} reduce${count === 1 ? "s" : ""} overall risk exposure.`,
    });
  }

  if (!gov?.securityProgram && !gov?.privacyProgram) {
    drivers.push({
      factor: "governance_gaps",
      contribution: 1,
      explanation: "No security or privacy program in place increases unmitigated risk.",
    });
  }

  return { adjustment: Math.max(-7, adjustment), drivers };
}

function computeJurisdictionBoost(answers: OrgAnswers): { boost: number; drivers: RiskDriver[] } {
  const drivers: RiskDriver[] = [];
  let boost = 0;
  const countries = answers.step2?.countries || [];

  const euCountries = ["EU", "Germany", "France", "Italy", "Spain", "Netherlands", "Belgium", "Austria", "Ireland", "Portugal", "Sweden", "Denmark", "Finland", "Poland", "Czech Republic", "Romania", "Greece", "Hungary"];
  const hasEU = countries.some((c) => euCountries.includes(c));
  if (hasEU) {
    boost += 2;
    drivers.push({ factor: "eu_jurisdiction", contribution: 2, explanation: "EU jurisdiction triggers EU AI Act and GDPR compliance requirements." });
  }

  const hasUS = countries.includes("US") || countries.includes("United States") || (answers.step2?.usStates?.length || 0) > 0;
  if (hasUS && (answers.step5?.phi || answers.step5?.pci)) {
    boost += 1;
    drivers.push({ factor: "us_regulated_data", contribution: 1, explanation: "US jurisdiction with regulated data (PHI/PCI) triggers HIPAA/PCI-DSS requirements." });
  }

  if (countries.length > 3) {
    boost += 1;
    drivers.push({ factor: "multi_jurisdiction", contribution: 1, explanation: "Operating in 4+ jurisdictions increases regulatory complexity." });
  }

  return { boost: Math.min(3, boost), drivers };
}

function scoreToTier(score: number, answers: OrgAnswers): RiskTier {
  const hasRegulatedData = answers.step5?.phi || answers.step5?.pci || answers.step5?.childrenData;
  const countries = answers.step2?.countries || [];
  const euCountries = ["EU", "Germany", "France", "Italy", "Spain", "Netherlands", "Belgium"];
  const hasEU = countries.some((c) => euCountries.includes(c));

  if (score >= 19 || (hasRegulatedData && hasEU)) return "REGULATED";
  if (score >= 13) return "HIGH";
  if (score >= 7) return "MEDIUM";
  return "LOW";
}

export function computeOrgRiskScore(answers: OrgAnswers): RiskResult {
  const impact = computeImpactScore(answers);
  const likelihood = computeLikelihoodScore(answers);
  const governance = computeGovernanceAdjustment(answers);
  const jurisdiction = computeJurisdictionBoost(answers);

  const inherentRisk = impact.score * likelihood.score;
  const finalScore = Math.max(1, Math.min(25, inherentRisk + governance.adjustment + jurisdiction.boost));
  const tier = scoreToTier(finalScore, answers);

  const allDrivers = [...impact.drivers, ...likelihood.drivers, ...governance.drivers, ...jurisdiction.drivers];

  return { score: finalScore, tier, drivers: allDrivers };
}
