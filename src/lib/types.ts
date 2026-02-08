/**
 * NIST AI RMF compliance app – data types
 * Organization → one OrgAssessment (Govern + playbook) → many ProductAssessments (Map, Measure, Manage)
 */

export type Id = string;

/** Playbook: org-defined methods, templates, and tools for Map, Measure, Manage */
export interface Playbook {
  map: {
    methods: string;
    templates: string;
    tools: string;
  };
  measure: {
    methods: string;
    templates: string;
    tools: string;
  };
  manage: {
    methods: string;
    templates: string;
    tools: string;
  };
}

export interface Organization {
  id: Id;
  name: string;
  createdAt: string; // ISO
}

/** Organization-level assessment: Govern outcomes + playbook (methods/templates/tools for Map, Measure, Manage) */
export interface OrganizationAssessment {
  id: Id;
  organizationId: Id;
  /** Govern: policies, roles, risk tolerance, culture, etc. */
  govern: {
    legalRegulatoryAwareness: string;
    policiesAndProcedures: string;
    riskTolerance: string;
    documentationAndTransparency: string;
    monitoringAndReview: string;
    aiSystemInventory: string;
    rolesAndResponsibilities: string;
    training: string;
    leadershipAccountability: string;
    diversityAndInclusion: string;
    humanAIConfigurations: string;
    riskCulture: string;
  };
  /** Org-defined playbook for Map, Measure, Manage */
  playbook: Playbook;
  updatedAt: string;
}

/** Product/project-level assessment: execute Map, Measure, Manage with project-specific details and evidence */
export interface ProductAssessment {
  id: Id;
  organizationId: Id;
  name: string; // AI project name
  /** Map: context, stakeholders, risks – project-specific details and evidence */
  map: {
    contextAndStakeholders: string;
    taskAndMethods: string;
    knowledgeLimitsAndOversight: string;
    tevvConsiderations: string;
    evidence: string;
  };
  /** Measure: testing, evaluation, monitoring – project-specific details and evidence */
  measure: {
    performanceMetrics: string;
    testingAndValidation: string;
    monitoringAndOngoingEval: string;
    evidence: string;
  };
  /** Manage: allocation, response, adjustment – project-specific details and evidence */
  manage: {
    resourceAllocation: string;
    incidentResponse: string;
    reviewAndAdjustment: string;
    evidence: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  organizations: Organization[];
  organizationAssessments: OrganizationAssessment[];
  productAssessments: ProductAssessment[];
}
