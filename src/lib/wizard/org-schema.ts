import { z } from "zod";

export const step1Schema = z.object({
  orgName: z.string().min(1, "Organization name is required"),
  orgSize: z.enum(["1-50", "51-500", "501-5000", "5000+"]),
  sector: z.string().min(1, "Sector is required"),
  businessModel: z.string().optional(),
});

export const step2Schema = z.object({
  countries: z.array(z.string()).min(1, "Select at least one country"),
  usStates: z.array(z.string()).default([]),
});

export const step3Schema = z.object({
  maturityStage: z.enum(["none", "pilots", "production", "enterprise"]),
});

export const step4Schema = z.object({
  overallTolerance: z.enum(["low", "medium", "high"]),
  financial: z.number().min(1).max(5),
  operational: z.number().min(1).max(5),
  safetyWellbeing: z.number().min(1).max(5),
  reputational: z.number().min(1).max(5),
});

export const step5Schema = z.object({
  pii: z.boolean().default(false),
  phi: z.boolean().default(false),
  pci: z.boolean().default(false),
  biometric: z.boolean().default(false),
  childrenData: z.boolean().default(false),
  retentionNeeds: z.boolean().default(false),
  multiTenant: z.boolean().default(false),
});

export const step6Schema = z.object({
  aiUsage: z.array(z.string()).min(1, "Select at least one AI usage type"),
});

export const step7Schema = z.object({
  providers: z.array(z.string()).min(1, "Select at least one provider"),
  deployment: z.enum(["on-prem", "cloud", "hybrid"]),
  thirdPartyComponents: z.boolean().default(false),
});

export const step8Schema = z.object({
  securityProgram: z.boolean().default(false),
  privacyProgram: z.boolean().default(false),
  modelInventory: z.boolean().default(false),
  incidentResponse: z.boolean().default(false),
  sdlcControls: z.boolean().default(false),
});

export const step9Schema = z.object({
  impactAssessments: z.enum(["never", "ad_hoc", "systematic"]),
  externalEngagement: z.enum(["never", "sometimes", "regularly"]),
  recourseMechanisms: z.boolean().default(false),
  publishedPrinciples: z.boolean().default(false),
});

export const orgStepSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
  step9Schema,
];

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type Step7Data = z.infer<typeof step7Schema>;
export type Step8Data = z.infer<typeof step8Schema>;
export type Step9Data = z.infer<typeof step9Schema>;
