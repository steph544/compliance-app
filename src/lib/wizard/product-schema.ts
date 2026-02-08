import { z } from "zod";

export const productStep1Schema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  businessObjective: z.string().min(1, "Business objective is required"),
  projectStage: z.enum(["ideation", "design", "development", "testing", "production"]),
  department: z.string().min(1, "Department is required"),
  projectOwner: z.string().min(1, "Project owner is required"),
});

export const productStep2Schema = z.object({
  couldSolveWithoutAI: z.enum(["yes", "no", "unsure"]),
  aiMaterialAdvantage: z.enum(["yes", "no", "unsure"]),
  machineErrorMoreHarmful: z.boolean().default(false),
  worstCaseImpact: z.enum(["low", "medium", "high", "critical"]),
  buildIntegrateBuy: z.enum(["build", "integrate", "buy"]),
});

export const productStep3Schema = z.object({
  aiType: z.array(z.string()).min(1, "Select at least one AI type"),
  modelSource: z.enum(["build", "buy", "fine-tune", "api"]),
  specificModels: z.array(z.string()).default([]),
  trainingDataSource: z.array(z.string()).default([]),
});

export const productStep4Schema = z.object({
  endUsers: z.enum(["employees", "customers", "public"]),
  decisions: z.string().default(""),
  canDenyServices: z.boolean().default(false),
  impactSeverity: z.enum(["low", "medium", "high", "critical"]),
  affectedPopulation: z.enum(["small", "medium", "large"]),
  upstreamStakeholders: z.array(z.string()).default([]),
  downstreamStakeholders: z.array(z.string()).default([]),
  inclusionConcerns: z.array(z.string()).default([]),
});

export const productStep5Schema = z.object({
  dataTypes: z.array(z.string()).default([]),
  dataSources: z.array(z.string()).default([]),
  lawfulBasis: z.string().default(""),
  crossBorderDataFlows: z.boolean().default(false),
  dataResidency: z.string().default(""),
  dataRetention: z.string().default(""),
  consentMechanisms: z.string().default(""),
  anonymization: z.string().default(""),
});

export const productStep6Schema = z.object({
  inputTypes: z.string().default(""),
  outputTypes: z.string().default(""),
  integrationPoints: z.string().default(""),
  humanAIConfig: z.enum(["in_the_loop", "on_the_loop", "out_of_the_loop"]),
  operatorProficiency: z.string().default(""),
  operatorOverrideAuthority: z.boolean().default(true),
  fallback: z.string().default(""),
  latencyRequirements: z.string().default(""),
  logging: z.string().default(""),
  modelSize: z.enum(["small", "medium", "large"]),
  inferenceVolume: z.enum(["low", "medium", "high"]),
  cloudRegion: z.string().default(""),
});

export const productStep7Schema = z.object({
  promptInjectionExposure: z.boolean().default(false),
  hallucinationRisk: z.enum(["low", "medium", "high"]),
  biasRiskCategories: z.array(z.string()).default([]),
  adversarialAttackSurface: z.string().default(""),
  dataPoisoningRisk: z.boolean().default(false),
  ipConfidentialityConcerns: z.boolean().default(false),
  regulatoryRisks: z.array(z.string()).default([]),
});

const baselineMetricSchema = z.object({
  name: z.string(),
  currentValue: z.string(),
  target: z.string(),
  mustHave: z.boolean(),
});

const raiConstraintSchema = z.object({
  metric: z.string(),
  threshold: z.string(),
  owner: z.string(),
});

export const productStep8Schema = z.object({
  baselineMetrics: z.array(baselineMetricSchema).default([]),
  raiConstraints: z.array(raiConstraintSchema).default([]),
});

export const productStep9Schema = z.object({
  testingPlan: z.boolean().default(false),
  monitoring: z.boolean().default(false),
  documentation: z.boolean().default(false),
  accessControls: z.boolean().default(false),
  humanReview: z.boolean().default(false),
  incidentResponse: z.boolean().default(false),
});

export const productStep10Schema = z.object({
  regulatoryRequirementsIdentified: z.boolean().default(false),
  legalReviewCompleted: z.boolean().default(false),
  ethicsReviewCompleted: z.boolean().default(false),
  stakeholderSignOff: z.boolean().default(false),
  goLiveCriteriaDefined: z.boolean().default(false),
});

export const productStepSchemas = [
  productStep1Schema,
  productStep2Schema,
  productStep3Schema,
  productStep4Schema,
  productStep5Schema,
  productStep6Schema,
  productStep7Schema,
  productStep8Schema,
  productStep9Schema,
  productStep10Schema,
];
