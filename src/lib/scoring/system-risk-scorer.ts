import { RiskTier } from "./types";

interface AISystemRegistryEntry {
  name?: string;
  dataTypes?: string[];
  hasAutomatedDecisions?: boolean;
  affectsExternalUsers?: boolean;
  vendorType?: "INTERNAL" | "THIRD_PARTY" | "HYBRID";
  governanceElements?: {
    hasModelCard?: boolean;
    hasImpactAssessment?: boolean;
    hasMonitoring?: boolean;
    hasIncidentPlan?: boolean;
    hasHumanOversight?: boolean;
  };
}

interface SystemRiskResult {
  tier: RiskTier;
  score: number;
  breakdown: { factor: string; points: number; explanation: string }[];
}

const SENSITIVE_DATA_TYPES: Record<string, number> = {
  PHI: 3,
  PII: 2,
  biometric: 3,
  children: 3,
  children_data: 3,
  PCI: 2,
  financial: 2,
  health: 3,
  genetic: 3,
  criminal: 2,
  location: 1,
  behavioral: 1,
};

export function computeSystemRiskTier(system: AISystemRegistryEntry): SystemRiskResult {
  let score = 0;
  const breakdown: { factor: string; points: number; explanation: string }[] = [];

  // Data sensitivity scoring
  const dataTypes = system.dataTypes || [];
  let dataScore = 0;
  const sensitiveTypes: string[] = [];

  for (const dt of dataTypes) {
    const sensitivity = SENSITIVE_DATA_TYPES[dt];
    if (sensitivity !== undefined && sensitivity > dataScore) {
      dataScore = sensitivity;
      sensitiveTypes.push(dt);
    } else if (sensitivity !== undefined) {
      sensitiveTypes.push(dt);
    }
  }

  if (dataScore > 0) {
    score += dataScore;
    breakdown.push({
      factor: "data_sensitivity",
      points: dataScore,
      explanation: `Processes sensitive data types (${sensitiveTypes.join(", ")}). Highest sensitivity score: ${dataScore}.`,
    });
  }

  // Automated decisions
  if (system.hasAutomatedDecisions) {
    score += 2;
    breakdown.push({
      factor: "automated_decisions",
      points: 2,
      explanation: "System makes automated decisions, increasing risk of harm from errors or bias.",
    });
  }

  // External users
  if (system.affectsExternalUsers) {
    score += 2;
    breakdown.push({
      factor: "external_users",
      points: 2,
      explanation: "System affects external users, increasing reputational, legal, and harm exposure.",
    });
  }

  // Vendor type
  if (system.vendorType === "THIRD_PARTY") {
    score += 1;
    breakdown.push({
      factor: "third_party_vendor",
      points: 1,
      explanation: "Third-party system introduces supply chain risk and reduces direct control over model behavior.",
    });
  }

  // Missing governance elements
  const governance = system.governanceElements;
  if (governance) {
    const governanceChecks: { key: keyof NonNullable<typeof governance>; label: string }[] = [
      { key: "hasModelCard", label: "model card" },
      { key: "hasImpactAssessment", label: "impact assessment" },
      { key: "hasMonitoring", label: "monitoring" },
      { key: "hasIncidentPlan", label: "incident response plan" },
      { key: "hasHumanOversight", label: "human oversight" },
    ];

    for (const check of governanceChecks) {
      if (!governance[check.key]) {
        score += 1;
        breakdown.push({
          factor: `missing_${check.key}`,
          points: 1,
          explanation: `Missing ${check.label} increases unmitigated risk exposure.`,
        });
      }
    }
  } else {
    // No governance elements documented at all
    score += 5;
    breakdown.push({
      factor: "no_governance_documentation",
      points: 5,
      explanation: "No governance elements documented. All five governance checks are missing.",
    });
  }

  // Map score to tier
  const tier = mapScoreToTier(score);

  return { tier, score, breakdown };
}

function mapScoreToTier(score: number): RiskTier {
  if (score >= 10) return "REGULATED";
  if (score >= 7) return "HIGH";
  if (score >= 4) return "MEDIUM";
  return "LOW";
}
