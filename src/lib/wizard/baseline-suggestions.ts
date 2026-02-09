/**
 * Generates AI-suggested baseline metrics and RAI constraints based on
 * product assessment answers from steps 1–7.
 */

export interface BaselineMetricSuggestion {
  name: string;
  currentValue: string;
  target: string;
  mustHave: boolean;
  reason?: string;
  /** Set by API when suggestion is from LLM; used to show "AI" badge in UI. */
  aiGenerated?: boolean;
}

export interface RAIConstraintSuggestion {
  metric: string;
  threshold: string;
  owner: string;
  reason?: string;
  /** Set by API when suggestion is from LLM; used to show "AI" badge in UI. */
  aiGenerated?: boolean;
}

type Answers = Record<string, Record<string, unknown> | undefined>;

export function getBaselineSuggestions(answers: Answers): {
  suggestedMetrics: BaselineMetricSuggestion[];
  suggestedConstraints: RAIConstraintSuggestion[];
} {
  const step1 = answers.step1 as { projectName?: string; description?: string; projectStage?: string; department?: string } | undefined;
  const step3 = answers.step3 as { aiType?: string[]; modelSource?: string } | undefined;
  const step4 = answers.step4 as { endUsers?: string; impactSeverity?: string; canDenyServices?: boolean } | undefined;
  const step5 = answers.step5 as { dataTypes?: string[] } | undefined;
  const step6 = answers.step6 as { humanAIConfig?: string } | undefined;
  const step7 = answers.step7 as { hallucinationRisk?: string; biasRiskCategories?: string[] } | undefined;

  const suggestedMetrics: BaselineMetricSuggestion[] = [];
  const suggestedConstraints: RAIConstraintSuggestion[] = [];

  const projectName = step1?.projectName?.trim() || "This project";
  const aiTypes = step3?.aiType ?? [];
  const impactSeverity = step4?.impactSeverity ?? "low";
  const endUsers = step4?.endUsers ?? "employees";
  const endUsersLabel = endUsers === "employees" ? "internal employees" : endUsers === "customers" ? "customers" : "the general public";
  const hasPII = step5?.dataTypes?.includes("PII") ?? false;
  const hasPHI = step5?.dataTypes?.includes("PHI") ?? false;
  const hasSensitiveData = hasPII || hasPHI || (step5?.dataTypes?.length ?? 0) > 0;
  const humanAIConfig = step6?.humanAIConfig ?? "on_the_loop";
  const canDenyServices = step4?.canDenyServices ?? false;
  const hallucinationRisk = step7?.hallucinationRisk ?? "low";
  const biasCategories = step7?.biasRiskCategories ?? [];
  const hasBiasRisks = biasCategories.length > 0;
  const department = step1?.department ?? "Engineering";

  // --- Baseline metrics (performance / business) ---

  if (aiTypes.includes("generative")) {
    suggestedMetrics.push(
      {
        name: "Output quality score",
        currentValue: "",
        target: "≥ 4.0 / 5",
        mustHave: true,
        reason: `Because ${projectName} uses generative AI, the system should meet a minimum output quality bar so generated content is reliable and useful.`,
      },
      {
        name: "Hallucination / factual error rate",
        currentValue: "",
        target: hallucinationRisk === "high" ? "< 2%" : hallucinationRisk === "medium" ? "< 1%" : "< 0.5%",
        mustHave: true,
        reason: `You indicated ${hallucinationRisk} hallucination risk for this generative AI system. Tracking factual error rate helps limit incorrect or fabricated content in model outputs.`,
      }
    );
  }

  if (aiTypes.includes("classification") || aiTypes.includes("recommendation")) {
    suggestedMetrics.push(
      {
        name: "Accuracy / F1 (or domain metric)",
        currentValue: "",
        target: "≥ 90%",
        mustHave: true,
        reason: `For this ${aiTypes.includes("classification") ? "classification" : "recommendation"} system, a clear accuracy or F1 target is needed so stakeholders know when the model performs acceptably.`,
      },
      {
        name: "Precision at K (if recommendation)",
        currentValue: "",
        target: "≥ 0.85",
        mustHave: false,
        reason: aiTypes.includes("recommendation")
          ? "Recommendation systems should measure relevance of top-K results; precision at K is a standard metric for this."
          : "If this system surfaces ranked recommendations, precision at K measures relevance of top results.",
      }
    );
  }

  if (aiTypes.includes("nlp")) {
    suggestedMetrics.push({
      name: "Task completion / intent accuracy",
      currentValue: "",
      target: "≥ 95%",
      mustHave: true,
      reason: `Because ${projectName} uses natural language processing, the system should reliably fulfill user intent; task completion or intent accuracy tracks that.`,
    });
  }

  if (impactSeverity === "high" || impactSeverity === "critical") {
    suggestedMetrics.push({
      name: "Human review rate (high-stakes decisions)",
      currentValue: "",
      target: "100%",
      mustHave: true,
      reason: `You rated impact severity as ${impactSeverity} for this system. High-impact decisions should have human review before they take effect, so we suggest tracking that 100% of such decisions are reviewed.`,
    });
  }

  if (canDenyServices) {
    suggestedMetrics.push({
      name: "Appeal / override rate",
      currentValue: "",
      target: "Track and review",
      mustHave: false,
      reason: "You indicated this AI system can deny services, benefits, or opportunities to individuals. Tracking appeal and override rates helps ensure fairness and accountability.",
    });
  }

  if (hasSensitiveData) {
    const dataContext = hasPII && hasPHI ? "PII and PHI" : hasPHI ? "PHI" : hasPII ? "PII" : "sensitive data";
    suggestedMetrics.push({
      name: "Privacy / security incident count",
      currentValue: "0",
      target: "0",
      mustHave: true,
      reason: `This project processes ${dataContext}. A zero-tolerance target for privacy and security incidents is recommended before go-live.`,
    });
  }

  // Default if nothing else suggested
  if (suggestedMetrics.length === 0) {
    suggestedMetrics.push({
      name: "Primary performance metric",
      currentValue: "",
      target: "Define based on use case",
      mustHave: true,
      reason: `Define at least one measurable success criterion for ${projectName} so you can track whether the system meets its goals.`,
    });
  }

  // --- RAI constraints ---

  if (hasBiasRisks) {
    suggestedConstraints.push({
      metric: "Fairness / disparity (e.g. demographic parity)",
      threshold: "Within acceptable range by group",
      owner: department,
      reason: `You identified ${biasCategories.length} bias risk categor${biasCategories.length === 1 ? "y" : "ies"} for this system. A fairness or disparity constraint ensures outcomes are acceptable across groups before deployment.`,
    });
  }

  if (hallucinationRisk === "medium" || hallucinationRisk === "high") {
    suggestedConstraints.push({
      metric: "Factual accuracy / hallucination rate",
      threshold: "< 1%",
      owner: department,
      reason: `Your assessment rated hallucination risk as ${hallucinationRisk} for this product. A strict factual-accuracy or hallucination-rate constraint is recommended before launch.`,
    });
  }

  if (humanAIConfig === "out_of_the_loop") {
    suggestedConstraints.push({
      metric: "Automated decision error rate",
      threshold: "Below defined threshold with monitoring",
      owner: department,
      reason: "You selected human-out-of-the-loop (fully autonomous) operation. Without real-time human oversight, the system should have a clear, monitored error-bound constraint before deployment.",
    });
  }

  if (endUsers === "customers" || endUsers === "public") {
    suggestedConstraints.push({
      metric: "User-facing error / failure rate",
      threshold: "≤ 0.1%",
      owner: department,
      reason: `This system’s end users are ${endUsersLabel}. User-facing errors and failures should be kept to a minimum (e.g. ≤ 0.1%) to protect trust and safety.`,
    });
  }

  if (hasPII || hasPHI) {
    const dataContext = hasPII && hasPHI ? "PII and PHI" : hasPHI ? "PHI (e.g. health data)" : "PII";
    suggestedConstraints.push({
      metric: "Data access / retention compliance",
      threshold: "100% compliant",
      owner: "Privacy / Legal",
      reason: `This project processes ${dataContext}. A compliance constraint for data access and retention (e.g. GDPR, HIPAA) should be met before go-live.`,
    });
  }

  if (impactSeverity === "critical") {
    suggestedConstraints.push({
      metric: "Safety / harm incidents",
      threshold: "0",
      owner: department,
      reason: "You rated impact severity as critical. We recommend a zero safety/harm incident constraint before release, with ongoing monitoring.",
    });
  }

  // Default RAI constraint
  if (suggestedConstraints.length === 0) {
    suggestedConstraints.push({
      metric: "Responsible AI review sign-off",
      threshold: "Completed before launch",
      owner: department,
      reason: `For ${projectName}, at least one responsible AI constraint (e.g. formal review sign-off) should be defined and completed before deployment.`,
    });
  }

  return { suggestedMetrics, suggestedConstraints };
}
