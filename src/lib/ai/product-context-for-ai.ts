/**
 * Shared product context builder for AI features (baseline suggestions, technical control recommendations).
 * Single source of truth for step1–7 extraction and text truncation.
 */

import type { BaselineSuggestionsContext } from "./generate-baseline-suggestions";

const MAX_TEXT_LENGTH = 1000;

export function truncate(s: string | undefined, max = MAX_TEXT_LENGTH): string {
  const t = typeof s === "string" ? s.trim() : "";
  if (!t) return "";
  return t.length <= max ? t : t.slice(0, max) + "…";
}

export type ProductContextForAI = Omit<
  BaselineSuggestionsContext,
  "existingMetricNames" | "existingConstraintMetrics"
>;

type Answers = Record<string, Record<string, unknown> | undefined>;

export function buildProductContextForAI(answers: Answers): ProductContextForAI {
  const step1 = answers.step1 as {
    projectName?: string;
    description?: string;
    businessObjective?: string;
    projectStage?: string;
    department?: string;
    projectOwner?: string;
  } | undefined;
  const step2 = answers.step2 as {
    couldSolveWithoutAI?: string;
    aiMaterialAdvantage?: string;
    machineErrorMoreHarmful?: boolean;
    worstCaseImpact?: string;
    buildIntegrateBuy?: string;
  } | undefined;
  const step3 = answers.step3 as {
    aiType?: string[];
    modelSource?: string;
    specificModels?: string[];
    trainingDataSource?: string[];
  } | undefined;
  const step4 = answers.step4 as {
    endUsers?: string;
    decisions?: string;
    canDenyServices?: boolean;
    impactSeverity?: string;
    affectedPopulation?: string;
    upstreamStakeholders?: string[];
    downstreamStakeholders?: string[];
    inclusionConcerns?: string[];
  } | undefined;
  const step5 = answers.step5 as {
    dataTypes?: string[];
    dataSources?: string[];
    lawfulBasis?: string;
    crossBorderDataFlows?: boolean;
    dataResidency?: string;
    dataRetention?: string;
    consentMechanisms?: string;
    anonymization?: string;
  } | undefined;
  const step6 = answers.step6 as {
    inputTypes?: string;
    outputTypes?: string;
    integrationPoints?: string;
    humanAIConfig?: string;
    operatorProficiency?: string;
    operatorOverrideAuthority?: boolean;
    fallback?: string;
    latencyRequirements?: string;
    logging?: string;
    modelSize?: string;
    inferenceVolume?: string;
    cloudRegion?: string;
  } | undefined;
  const step7 = answers.step7 as {
    promptInjectionExposure?: boolean;
    hallucinationRisk?: string;
    biasRiskCategories?: string[];
    adversarialAttackSurface?: string;
    dataPoisoningRisk?: boolean;
    ipConfidentialityConcerns?: boolean;
    regulatoryRisks?: string[];
  } | undefined;

  return {
    projectName: step1?.projectName?.trim() || "This project",
    description: truncate(step1?.description),
    businessObjective: truncate(step1?.businessObjective),
    projectStage: step1?.projectStage ?? "not specified",
    department: step1?.department ?? "Engineering",
    projectOwner: step1?.projectOwner?.trim() ?? "not specified",
    couldSolveWithoutAI: step2?.couldSolveWithoutAI ?? "not specified",
    aiMaterialAdvantage: step2?.aiMaterialAdvantage ?? "not specified",
    machineErrorMoreHarmful: step2?.machineErrorMoreHarmful ?? false,
    worstCaseImpact: step2?.worstCaseImpact ?? "not specified",
    buildIntegrateBuy: step2?.buildIntegrateBuy ?? "not specified",
    aiType: step3?.aiType ?? [],
    modelSource: step3?.modelSource ?? "not specified",
    specificModels: step3?.specificModels ?? [],
    trainingDataSource: step3?.trainingDataSource ?? [],
    endUsers: step4?.endUsers ?? "employees",
    decisions: truncate(step4?.decisions),
    canDenyServices: step4?.canDenyServices ?? false,
    impactSeverity: step4?.impactSeverity ?? "low",
    affectedPopulation: step4?.affectedPopulation ?? "not specified",
    upstreamStakeholders: step4?.upstreamStakeholders ?? [],
    downstreamStakeholders: step4?.downstreamStakeholders ?? [],
    inclusionConcerns: step4?.inclusionConcerns ?? [],
    dataTypes: step5?.dataTypes ?? [],
    dataSources: step5?.dataSources ?? [],
    lawfulBasis: truncate(step5?.lawfulBasis),
    crossBorderDataFlows: step5?.crossBorderDataFlows ?? false,
    dataResidency: truncate(step5?.dataResidency),
    dataRetention: truncate(step5?.dataRetention),
    consentMechanisms: truncate(step5?.consentMechanisms),
    anonymization: truncate(step5?.anonymization),
    inputTypes: truncate(step6?.inputTypes),
    outputTypes: truncate(step6?.outputTypes),
    integrationPoints: truncate(step6?.integrationPoints),
    humanAIConfig: step6?.humanAIConfig ?? "on_the_loop",
    operatorProficiency: truncate(step6?.operatorProficiency),
    operatorOverrideAuthority: step6?.operatorOverrideAuthority ?? true,
    fallback: truncate(step6?.fallback),
    latencyRequirements: truncate(step6?.latencyRequirements),
    logging: truncate(step6?.logging),
    modelSize: step6?.modelSize ?? "not specified",
    inferenceVolume: step6?.inferenceVolume ?? "not specified",
    cloudRegion: step6?.cloudRegion?.trim() ?? "not specified",
    promptInjectionExposure: step7?.promptInjectionExposure ?? false,
    hallucinationRisk: step7?.hallucinationRisk ?? "low",
    biasRiskCategories: step7?.biasRiskCategories ?? [],
    adversarialAttackSurface: truncate(step7?.adversarialAttackSurface),
    dataPoisoningRisk: step7?.dataPoisoningRisk ?? false,
    ipConfidentialityConcerns: step7?.ipConfidentialityConcerns ?? false,
    regulatoryRisks: step7?.regulatoryRisks ?? [],
  };
}
