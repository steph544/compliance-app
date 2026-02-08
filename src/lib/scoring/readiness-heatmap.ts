import { OrgAnswers, HeatmapDimension, ReadinessHeatmap } from "./types";

function scoreLabel(score: number): "Not Started" | "Beginning" | "Developing" | "Mature" {
  if (score <= 1) return "Not Started";
  if (score <= 2) return "Beginning";
  if (score <= 3) return "Developing";
  return "Mature";
}

function computeGovernanceDimension(answers: OrgAnswers): HeatmapDimension {
  let score = 0;
  const recs: string[] = [];
  const gov = answers.step8;
  const engagement = answers.step9;

  if (gov?.securityProgram) score += 0.5;
  else recs.push("Establish a formal security program covering AI systems.");

  if (gov?.privacyProgram) score += 0.5;
  else recs.push("Implement a privacy program with AI-specific data handling policies.");

  if (gov?.incidentResponse) score += 0.5;
  else recs.push("Create an AI incident response plan with clear escalation paths.");

  if (gov?.sdlcControls) score += 0.5;
  else recs.push("Integrate AI risk checks into your software development lifecycle.");

  if (engagement?.impactAssessments === "systematic") score += 0.75;
  else if (engagement?.impactAssessments === "ad_hoc") { score += 0.25; recs.push("Formalize impact assessments from ad-hoc to systematic process."); }
  else recs.push("Begin conducting AI impact assessments for all AI projects.");

  if (engagement?.publishedPrinciples) score += 0.5;
  else recs.push("Publish organizational AI principles to guide development teams.");

  if (engagement?.recourseMechanisms) score += 0.5;
  else recs.push("Establish recourse mechanisms for individuals affected by AI decisions.");

  const orgSize = answers.step1?.orgSize;
  if (orgSize === "501-5000" || orgSize === "5000+") {
    if (!gov?.modelInventory) recs.push("At your organization's scale, a formal AI model inventory is critical.");
  }

  return {
    name: "Governance",
    score: Math.max(1, Math.min(4, Math.round(score + 0.5))),
    label: scoreLabel(Math.max(1, Math.min(4, Math.round(score + 0.5)))),
    recommendations: recs.slice(0, 3),
  };
}

function computeDataDimension(answers: OrgAnswers): HeatmapDimension {
  let score = 1;
  const recs: string[] = [];
  const data = answers.step5;
  const gov = answers.step8;

  if (!data) return { name: "Data", score: 1, label: "Not Started", recommendations: ["Define your data posture and identify sensitive data types processed by AI systems."] };

  const sensitiveTypes = [data.pii, data.phi, data.pci, data.biometric, data.childrenData].filter(Boolean).length;

  if (sensitiveTypes > 0 && gov?.privacyProgram) score += 1.5;
  else if (sensitiveTypes > 0) { score += 0.5; recs.push("You handle sensitive data but lack a formal privacy program — this is a critical gap."); }

  if (data.retentionNeeds) score += 0.5;
  else if (sensitiveTypes > 0) recs.push("Define data retention policies for AI training and operational data.");

  if (gov?.securityProgram) score += 0.5;

  if (data.multiTenant) recs.push("Multi-tenant environments require strict data isolation controls for AI workloads.");

  if (sensitiveTypes >= 3) recs.push("With 3+ sensitive data types, implement automated data classification and DLP for AI pipelines.");

  return {
    name: "Data",
    score: Math.max(1, Math.min(4, Math.round(score))),
    label: scoreLabel(Math.max(1, Math.min(4, Math.round(score)))),
    recommendations: recs.slice(0, 3),
  };
}

function computeTechnologyDimension(answers: OrgAnswers): HeatmapDimension {
  let score = 1;
  const recs: string[] = [];
  const maturity = answers.step3?.maturityStage;
  const vendor = answers.step7;

  if (maturity === "enterprise") score += 2;
  else if (maturity === "production") score += 1.5;
  else if (maturity === "pilots") score += 0.5;
  else recs.push("Start with AI pilots to build technical capability before scaling.");

  if (vendor?.providers && vendor.providers.length > 0) score += 0.5;
  if (vendor?.deployment === "hybrid") score += 0.5;
  else if (vendor?.deployment === "cloud") score += 0.25;

  if ((vendor?.providers?.length || 0) > 2) recs.push("Standardize vendor evaluation criteria across your multiple AI providers.");
  if (vendor?.thirdPartyComponents) recs.push("Establish supply chain risk management for third-party AI components.");
  if (maturity !== "enterprise" && maturity !== "production") recs.push("Build internal AI expertise through training programs and proof-of-concept projects.");

  return {
    name: "Technology",
    score: Math.max(1, Math.min(4, Math.round(score))),
    label: scoreLabel(Math.max(1, Math.min(4, Math.round(score)))),
    recommendations: recs.slice(0, 3),
  };
}

function computePeopleDimension(answers: OrgAnswers): HeatmapDimension {
  let score = 1;
  const recs: string[] = [];
  const orgSize = answers.step1?.orgSize;
  const maturity = answers.step3?.maturityStage;
  const gov = answers.step8;

  if (orgSize === "5000+" && gov?.modelInventory) score += 1;
  else if (orgSize === "501-5000" && (gov?.securityProgram || gov?.privacyProgram)) score += 0.75;
  else if (orgSize === "51-500") score += 0.5;

  if (maturity === "enterprise" || maturity === "production") score += 0.75;
  if (gov?.sdlcControls) score += 0.5;

  if (!gov?.modelInventory) recs.push("Assign clear AI model ownership roles with documented responsibilities.");
  recs.push("Implement AI literacy training for all staff who interact with AI systems.");
  if (orgSize === "501-5000" || orgSize === "5000+") recs.push("Establish dedicated AI governance roles with cross-functional representation.");

  return {
    name: "People",
    score: Math.max(1, Math.min(4, Math.round(score))),
    label: scoreLabel(Math.max(1, Math.min(4, Math.round(score)))),
    recommendations: recs.slice(0, 3),
  };
}

function computeRiskComplianceDimension(answers: OrgAnswers): HeatmapDimension {
  let score = 1;
  const recs: string[] = [];
  const tolerance = answers.step4;
  const jurisdictions = answers.step2;
  const engagement = answers.step9;

  if (tolerance) score += 0.75;
  else recs.push("Define formal risk tolerance levels across financial, operational, safety, and reputational dimensions.");

  if (jurisdictions?.countries && jurisdictions.countries.length > 0) score += 0.5;
  if ((jurisdictions?.countries?.length || 0) > 2) score += 0.25;

  if (engagement?.externalEngagement === "regularly") score += 0.75;
  else if (engagement?.externalEngagement === "sometimes") { score += 0.25; recs.push("Increase external stakeholder engagement from occasional to regular cadence."); }
  else recs.push("Engage external stakeholders (community, advocacy groups, regulators) on AI impacts.");

  if (engagement?.impactAssessments === "systematic") score += 0.5;
  else recs.push("Implement systematic AI impact assessments across all projects.");

  const countries = jurisdictions?.countries || [];
  const euCountries = ["EU", "Germany", "France", "Italy", "Spain", "Netherlands"];
  if (countries.some((c) => euCountries.includes(c))) recs.push("Map your AI systems against EU AI Act risk categories for compliance readiness.");

  return {
    name: "Risk & Compliance",
    score: Math.max(1, Math.min(4, Math.round(score))),
    label: scoreLabel(Math.max(1, Math.min(4, Math.round(score)))),
    recommendations: recs.slice(0, 3),
  };
}

export function computeReadinessHeatmap(answers: OrgAnswers): ReadinessHeatmap {
  return {
    dimensions: [
      computeGovernanceDimension(answers),
      computeDataDimension(answers),
      computeTechnologyDimension(answers),
      computePeopleDimension(answers),
      computeRiskComplianceDimension(answers),
    ],
  };
}
