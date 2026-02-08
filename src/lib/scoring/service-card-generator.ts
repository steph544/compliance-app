import { ProductAnswers, ServiceCard } from "./types";

export function generateServiceCard(answers: ProductAnswers): ServiceCard {
  const step1 = answers.step1;
  const step3 = answers.step3;
  const step5 = answers.step5;
  const step6 = answers.step6;
  const step7 = answers.step7;

  // Purpose from step1
  const purpose = step1?.description || step1?.businessObjective || "Purpose not specified.";

  // Model info from step3
  const aiTypes = step3?.aiType || [];
  const modelType = aiTypes.length > 0 ? aiTypes.join(", ") : "Not specified";
  const modelProvider =
    step3?.modelSource === "build"
      ? "In-house"
      : step3?.modelSource === "api"
        ? `Third-party API (${step3?.specificModels?.join(", ") || "unspecified"})`
        : step3?.modelSource === "fine-tune"
          ? `Fine-tuned (${step3?.specificModels?.join(", ") || "unspecified"})`
          : step3?.modelSource === "buy"
            ? `Purchased (${step3?.specificModels?.join(", ") || "unspecified"})`
            : "Not specified";

  // Training data provenance from step3/step5
  const dataSources = step5?.dataSources || step3?.trainingDataSource || [];
  const trainingDataProvenance =
    dataSources.length > 0
      ? `Data sourced from: ${dataSources.join(", ")}. Lawful basis: ${step5?.lawfulBasis || "not specified"}.`
      : "Training data provenance not documented.";

  // Known limitations from step7
  const knownLimitations: string[] = [];

  if (step7?.hallucinationRisk === "high") {
    knownLimitations.push("High hallucination risk: the system may generate plausible but factually incorrect outputs.");
  } else if (step7?.hallucinationRisk === "medium") {
    knownLimitations.push("Moderate hallucination risk: outputs should be verified against authoritative sources.");
  }

  const biasCategories = step7?.biasRiskCategories || [];
  if (biasCategories.length > 0) {
    knownLimitations.push(
      `Potential bias risks identified in the following categories: ${biasCategories.join(", ")}. Outputs may reflect or amplify existing biases in these areas.`
    );
  }

  if (step7?.promptInjectionExposure) {
    knownLimitations.push(
      "System accepts user-provided input that may be susceptible to prompt injection attacks. Input validation and output filtering are required."
    );
  }

  if (step7?.dataPoisoningRisk) {
    knownLimitations.push("Training data may be susceptible to data poisoning, potentially affecting output integrity.");
  }

  if (step7?.ipConfidentialityConcerns) {
    knownLimitations.push("Confidential or proprietary information may be exposed through model outputs or memorization.");
  }

  if (knownLimitations.length === 0) {
    knownLimitations.push("No specific limitations have been documented. This should be reviewed and updated.");
  }

  // Appropriate uses based on step1
  const appropriateUses: string[] = [];
  if (step1?.businessObjective) {
    appropriateUses.push(step1.businessObjective);
  }
  if (step1?.description) {
    appropriateUses.push(step1.description);
  }
  if (appropriateUses.length === 0) {
    appropriateUses.push("Appropriate uses not yet defined.");
  }

  // Prohibited uses based on risk level
  const prohibitedUses: string[] = [];
  const impactSeverity = answers.step4?.impactSeverity;

  prohibitedUses.push("Do not use for purposes outside the documented scope without additional review and approval.");

  if (impactSeverity === "critical" || impactSeverity === "high") {
    prohibitedUses.push("Do not use as the sole basis for decisions that could cause significant harm to individuals.");
    prohibitedUses.push("Do not deploy in safety-critical contexts without human-in-the-loop oversight.");
  }

  if (answers.step4?.canDenyServices) {
    prohibitedUses.push("Do not use to make final denial-of-service decisions without qualified human review.");
  }

  if (step7?.promptInjectionExposure) {
    prohibitedUses.push("Do not expose directly to untrusted user input without input sanitization and output filtering.");
  }

  if (biasCategories.length > 0) {
    prohibitedUses.push(
      "Do not use for high-stakes decisions in bias-sensitive categories without bias testing and mitigation measures."
    );
  }

  // Human oversight level from step6
  const humanAIConfigMap: Record<string, string> = {
    in_the_loop: "Human-in-the-loop: a human reviews and approves every AI output before action is taken.",
    on_the_loop: "Human-on-the-loop: the AI operates autonomously with human monitoring and intervention capability.",
    out_of_the_loop: "Human-out-of-the-loop: the AI operates autonomously with periodic aggregate performance review.",
  };
  const humanOversightLevel =
    humanAIConfigMap[step6?.humanAIConfig || ""] || "Human oversight level not specified.";

  // Bias testing results
  const biasTestingResults =
    biasCategories.length > 0
      ? `Bias risk categories identified: ${biasCategories.join(", ")}. Bias testing should be conducted prior to deployment and on an ongoing basis.`
      : "No specific bias risk categories identified. Baseline bias testing is still recommended.";

  // Monitoring requirements
  const monitoringRequirements: string[] = [
    "Track model performance metrics against established baselines.",
  ];

  if (step7?.hallucinationRisk === "high" || step7?.hallucinationRisk === "medium") {
    monitoringRequirements.push("Monitor output accuracy and hallucination rates with regular sampling.");
  }

  if (biasCategories.length > 0) {
    monitoringRequirements.push("Monitor for disparate impact across identified bias risk categories.");
  }

  if (step7?.promptInjectionExposure) {
    monitoringRequirements.push("Monitor for prompt injection attempts and adversarial inputs.");
  }

  monitoringRequirements.push("Monitor system availability and latency against SLA targets.");
  monitoringRequirements.push("Review and update this service card at least quarterly or upon significant system changes.");

  return {
    purpose,
    modelType,
    modelProvider,
    trainingDataProvenance,
    knownLimitations,
    appropriateUses,
    prohibitedUses,
    humanOversightLevel,
    biasTestingResults,
    monitoringRequirements,
  };
}
