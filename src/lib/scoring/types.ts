export type RiskTier = "LOW" | "MEDIUM" | "HIGH" | "REGULATED";

export interface RiskDriver {
  factor: string;
  contribution: number;
  explanation: string;
}

export interface RiskResult {
  score: number;
  tier: RiskTier;
  drivers: RiskDriver[];
}

export interface OrgAnswers {
  step1?: {
    orgName: string;
    orgSize: "1-50" | "51-500" | "501-5000" | "5000+";
    sector: string;
    businessModel?: string;
  };
  step2?: {
    countries: string[];
    usStates: string[];
  };
  step3?: {
    maturityStage: "none" | "pilots" | "production" | "enterprise";
  };
  step4?: {
    overallTolerance: "low" | "medium" | "high";
    financial: number;
    operational: number;
    safetyWellbeing: number;
    reputational: number;
  };
  step5?: {
    pii: boolean;
    phi: boolean;
    pci: boolean;
    biometric: boolean;
    childrenData: boolean;
    retentionNeeds: boolean;
    multiTenant: boolean;
  };
  step6?: {
    aiUsage: string[];
  };
  step7?: {
    providers: string[];
    deployment: "on-prem" | "cloud" | "hybrid";
    thirdPartyComponents: boolean;
  };
  step8?: {
    securityProgram: boolean;
    privacyProgram: boolean;
    modelInventory: boolean;
    incidentResponse: boolean;
    sdlcControls: boolean;
  };
  step9?: {
    impactAssessments: "never" | "ad_hoc" | "systematic";
    externalEngagement: "never" | "sometimes" | "regularly";
    recourseMechanisms: boolean;
    publishedPrinciples: boolean;
  };
}

export interface HeatmapDimension {
  name: string;
  score: number; // 1-4
  label: "Not Started" | "Beginning" | "Developing" | "Mature";
  recommendations: string[];
}

export interface ReadinessHeatmap {
  dimensions: HeatmapDimension[];
}

export interface ThreeLineOfDefense {
  line: 1 | 2 | 3;
  role: string;
  description: string;
  assignedTo: string;
}

export interface GovernanceBlueprint {
  threeLoD: ThreeLineOfDefense[];
  roles: { title: string; description: string; line: number }[];
  committees: { name: string; members: string; cadence: string; charter: string }[];
  decisionRights: { decision: string; responsible: string; accountable: string; consulted: string; informed: string }[];
  reviewCadence: string;
  humanAiPatterns: { pattern: string; description: string; whenToApply: string }[];
  whistleblower: { channel: string; process: string; sla: string };
  escalation: { level: string; trigger: string; owner: string; timeline: string }[];
}

export interface ProductAnswers {
  step1?: {
    projectName: string;
    description: string;
    businessObjective: string;
    projectStage: "ideation" | "design" | "development" | "testing" | "production";
    department: string;
    projectOwner: string;
  };
  step2?: {
    couldSolveWithoutAI: "yes" | "no" | "unsure";
    aiMaterialAdvantage: "yes" | "no" | "unsure";
    machineErrorMoreHarmful: boolean;
    worstCaseImpact: "low" | "medium" | "high" | "critical";
    buildIntegrateBuy: "build" | "integrate" | "buy";
  };
  step3?: {
    aiType: string[];
    modelSource: "build" | "buy" | "fine-tune" | "api";
    specificModels: string[];
    trainingDataSource: string[];
  };
  step4?: {
    endUsers: "employees" | "customers" | "public";
    decisions: string;
    canDenyServices: boolean;
    impactSeverity: "low" | "medium" | "high" | "critical";
    affectedPopulation: "small" | "medium" | "large";
    upstreamStakeholders: string[];
    downstreamStakeholders: string[];
    inclusionConcerns: string[];
  };
  step5?: {
    dataTypes: string[];
    dataSources: string[];
    lawfulBasis: string;
    crossBorderDataFlows: boolean;
    dataResidency: string;
    dataRetention: string;
    consentMechanisms: string;
    anonymization: string;
  };
  step6?: {
    inputTypes: string;
    outputTypes: string;
    integrationPoints: string;
    humanAIConfig: "in_the_loop" | "on_the_loop" | "out_of_the_loop";
    operatorProficiency: string;
    operatorOverrideAuthority: boolean;
    fallback: string;
    latencyRequirements: string;
    logging: string;
    modelSize: "small" | "medium" | "large";
    inferenceVolume: "low" | "medium" | "high";
    cloudRegion: string;
  };
  step7?: {
    promptInjectionExposure: boolean;
    hallucinationRisk: "low" | "medium" | "high";
    biasRiskCategories: string[];
    adversarialAttackSurface: string;
    dataPoisoningRisk: boolean;
    ipConfidentialityConcerns: boolean;
    regulatoryRisks: string[];
  };
  step8?: {
    baselineMetrics: { name: string; currentValue: string; target: string; mustHave: boolean }[];
    raiConstraints: { metric: string; threshold: string; owner: string }[];
  };
  step9?: {
    testingPlan: boolean;
    monitoring: boolean;
    documentation: boolean;
    accessControls: boolean;
    humanReview: boolean;
    incidentResponse: boolean;
  };
  step10?: {
    regulatoryRequirementsIdentified: boolean;
    legalReviewCompleted: boolean;
    ethicsReviewCompleted: boolean;
    stakeholderSignOff: boolean;
    goLiveCriteriaDefined: boolean;
  };
}

export interface FitForAIResult {
  validated: boolean;
  concerns: string[];
  recommendation: string;
}

export interface ReleaseCriterion {
  metric: string;
  type: "ROI" | "RAI";
  threshold: string;
  dataSource: string;
  owner: string;
  authority: "block_release" | "allow_with_controls";
}

export interface StakeholderMap {
  upstream: string[];
  downstream: string[];
  inclusionConcerns: string[];
}

export interface ServiceCard {
  purpose: string;
  modelType: string;
  modelProvider: string;
  trainingDataProvenance: string;
  knownLimitations: string[];
  appropriateUses: string[];
  prohibitedUses: string[];
  humanOversightLevel: string;
  biasTestingResults: string;
  monitoringRequirements: string[];
}

export interface ImplementationPhase {
  phase: string;
  tasks: { task: string; status: "pending" | "in_progress" | "completed" }[];
}

export interface ComplianceRequirement {
  regulation: string;
  requirements: string[];
  applicability: string;
}

export interface MonitoringSpec {
  metrics: { name: string; threshold: string; alertCondition: string }[];
  dashboardSpec: string;
  environmentalTracking: { modelSize: string; inferenceVolume: string; estimatedFootprint: string };
}
