"use client";

import type {
  AppData,
  Organization,
  OrganizationAssessment,
  Playbook,
  ProductAssessment,
} from "./types";

const STORAGE_KEY = "compliance-app-data";

const emptyPlaybook: Playbook = {
  map: { methods: "", templates: "", tools: "" },
  measure: { methods: "", templates: "", tools: "" },
  manage: { methods: "", templates: "", tools: "" },
};

function load(): AppData {
  if (typeof window === "undefined") {
    return {
      organizations: [],
      organizationAssessments: [],
      productAssessments: [],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { organizations: [], organizationAssessments: [], productAssessments: [] };
    return JSON.parse(raw) as AppData;
  } catch {
    return { organizations: [], organizationAssessments: [], productAssessments: [] };
  }
}

function save(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function id(): string {
  return Math.random().toString(36).slice(2, 12);
}

export function createOrganization(name: string): Organization {
  const org: Organization = {
    id: id(),
    name,
    createdAt: new Date().toISOString(),
  };
  const data = load();
  data.organizations.push(org);
  save(data);
  return org;
}

export function getOrganization(orgId: string): Organization | undefined {
  return load().organizations.find((o) => o.id === orgId);
}

export function getOrganizationAssessment(orgId: string): OrganizationAssessment | undefined {
  return load().organizationAssessments.find((a) => a.organizationId === orgId);
}

export function saveOrganizationAssessment(
  organizationId: string,
  partial: Partial<Omit<OrganizationAssessment, "id" | "organizationId" | "updatedAt">>
): OrganizationAssessment {
  const data = load();
  const existing = data.organizationAssessments.find((a) => a.organizationId === organizationId);
  const updatedAt = new Date().toISOString();

  if (existing) {
    const updated: OrganizationAssessment = {
      ...existing,
      ...partial,
      govern: partial.govern ?? existing.govern,
      playbook: partial.playbook ?? existing.playbook,
      updatedAt,
    };
    const idx = data.organizationAssessments.findIndex((a) => a.id === existing.id);
    data.organizationAssessments[idx] = updated;
    save(data);
    return updated;
  }

  const newAssessment: OrganizationAssessment = {
    id: id(),
    organizationId,
    govern: partial.govern ?? {
      legalRegulatoryAwareness: "",
      policiesAndProcedures: "",
      riskTolerance: "",
      documentationAndTransparency: "",
      monitoringAndReview: "",
      aiSystemInventory: "",
      rolesAndResponsibilities: "",
      training: "",
      leadershipAccountability: "",
      diversityAndInclusion: "",
      humanAIConfigurations: "",
      riskCulture: "",
    },
    playbook: partial.playbook ?? emptyPlaybook,
    updatedAt,
  };
  data.organizationAssessments.push(newAssessment);
  save(data);
  return newAssessment;
}

export function createProductAssessment(organizationId: string, name: string): ProductAssessment {
  const now = new Date().toISOString();
  const assessment: ProductAssessment = {
    id: id(),
    organizationId,
    name,
    map: {
      contextAndStakeholders: "",
      taskAndMethods: "",
      knowledgeLimitsAndOversight: "",
      tevvConsiderations: "",
      evidence: "",
    },
    measure: {
      performanceMetrics: "",
      testingAndValidation: "",
      monitoringAndOngoingEval: "",
      evidence: "",
    },
    manage: {
      resourceAllocation: "",
      incidentResponse: "",
      reviewAndAdjustment: "",
      evidence: "",
    },
    createdAt: now,
    updatedAt: now,
  };
  const data = load();
  data.productAssessments.push(assessment);
  save(data);
  return assessment;
}

export function getProductAssessments(organizationId: string): ProductAssessment[] {
  return load().productAssessments.filter((a) => a.organizationId === organizationId);
}

export function getProductAssessment(assessmentId: string): ProductAssessment | undefined {
  return load().productAssessments.find((a) => a.id === assessmentId);
}

export function saveProductAssessment(
  assessmentId: string,
  partial: Partial<Omit<ProductAssessment, "id" | "organizationId" | "name" | "createdAt">>
): ProductAssessment | undefined {
  const data = load();
  const idx = data.productAssessments.findIndex((a) => a.id === assessmentId);
  if (idx === -1) return undefined;
  const existing = data.productAssessments[idx];
  const updated: ProductAssessment = {
    ...existing,
    ...partial,
    map: partial.map ?? existing.map,
    measure: partial.measure ?? existing.measure,
    manage: partial.manage ?? existing.manage,
    updatedAt: new Date().toISOString(),
  };
  data.productAssessments[idx] = updated;
  save(data);
  return updated;
}

export function getAllOrganizations(): Organization[] {
  return load().organizations;
}

export { load, save, emptyPlaybook };
