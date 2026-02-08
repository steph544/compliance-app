"use client";

import type {
  Organization,
  OrganizationAssessment,
  Playbook,
  ProductAssessment,
} from "./types";

const emptyPlaybook: Playbook = {
  map: { methods: "", templates: "", tools: "" },
  measure: { methods: "", templates: "", tools: "" },
  manage: { methods: "", templates: "", tools: "" },
};

const defaultGovern = {
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
};

const emptyMap = {
  contextAndStakeholders: "",
  taskAndMethods: "",
  knowledgeLimitsAndOversight: "",
  tevvConsiderations: "",
  evidence: "",
};
const emptyMeasure = {
  performanceMetrics: "",
  testingAndValidation: "",
  monitoringAndOngoingEval: "",
  evidence: "",
};
const emptyManage = {
  resourceAllocation: "",
  incidentResponse: "",
  reviewAndAdjustment: "",
  evidence: "",
};

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 401) {
    window.location.href = "/sign-in";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = "/sign-in";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = "/sign-in";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

type ApiOrgAssessment = {
  id: string;
  orgName: string;
  answers: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type ApiProductAssessment = {
  id: string;
  projectName: string;
  answers: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

function mapOrgToOrganization(row: ApiOrgAssessment): Organization {
  return {
    id: row.id,
    name: row.orgName,
    createdAt: row.createdAt,
  };
}

function mapAnswersToOrgAssessment(
  orgId: string,
  answers: Record<string, unknown> | null,
  updatedAt: string
): OrganizationAssessment {
  const a = (answers ?? {}) as {
    govern?: Record<string, string>;
    playbook?: Playbook;
  };
  return {
    id: orgId,
    organizationId: orgId,
    govern: a.govern
      ? { ...defaultGovern, ...a.govern }
      : defaultGovern,
    playbook: a.playbook
      ? { ...emptyPlaybook, ...a.playbook, map: { ...emptyPlaybook.map, ...a.playbook?.map }, measure: { ...emptyPlaybook.measure, ...a.playbook?.measure }, manage: { ...emptyPlaybook.manage, ...a.playbook?.manage } }
      : emptyPlaybook,
    updatedAt,
  };
}

function mapProductToAssessment(orgId: string, row: ApiProductAssessment): ProductAssessment {
  const a = (row.answers ?? {}) as { map?: typeof emptyMap; measure?: typeof emptyMeasure; manage?: typeof emptyManage };
  return {
    id: row.id,
    organizationId: orgId,
    name: row.projectName,
    map: a.map ? { ...emptyMap, ...a.map } : emptyMap,
    measure: a.measure ? { ...emptyMeasure, ...a.measure } : emptyMeasure,
    manage: a.manage ? { ...emptyManage, ...a.manage } : emptyManage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listOrganizations(): Promise<Organization[]> {
  const rows = await apiGet<ApiOrgAssessment[]>("/api/org-assessments");
  return rows.map(mapOrgToOrganization);
}

export async function createOrganization(name: string): Promise<Organization> {
  const row = await apiPost<ApiOrgAssessment>("/api/org-assessments", { orgName: name });
  return mapOrgToOrganization(row);
}

export async function getOrganization(orgId: string): Promise<Organization | undefined> {
  try {
    const row = await apiGet<ApiOrgAssessment>(`/api/org-assessments/${orgId}`);
    return mapOrgToOrganization(row);
  } catch {
    return undefined;
  }
}

export async function getOrganizationAssessment(
  orgId: string
): Promise<OrganizationAssessment | undefined> {
  try {
    const row = await apiGet<ApiOrgAssessment & { answers: Record<string, unknown> | null }>(
      `/api/org-assessments/${orgId}`
    );
    return mapAnswersToOrgAssessment(orgId, row.answers, row.updatedAt);
  } catch {
    return undefined;
  }
}

export async function saveOrganizationAssessment(
  organizationId: string,
  partial: Partial<Omit<OrganizationAssessment, "id" | "organizationId" | "updatedAt">>
): Promise<OrganizationAssessment> {
  const body: { answers: { govern?: unknown; playbook?: unknown } } = {
    answers: {},
  };
  if (partial.govern) body.answers.govern = partial.govern;
  if (partial.playbook) body.answers.playbook = partial.playbook;

  const row = await apiPatch<ApiOrgAssessment & { answers: Record<string, unknown> | null }>(
    `/api/org-assessments/${organizationId}`,
    body
  );
  return mapAnswersToOrgAssessment(organizationId, row.answers, row.updatedAt);
}

export async function getProductAssessments(orgId: string): Promise<ProductAssessment[]> {
  const rows = await apiGet<ApiProductAssessment[]>(`/api/org-assessments/${orgId}/products`);
  return rows.map((r) => mapProductToAssessment(orgId, r));
}

export async function createProductAssessment(
  organizationId: string,
  name: string
): Promise<ProductAssessment> {
  const row = await apiPost<ApiProductAssessment>(
    `/api/org-assessments/${organizationId}/products`,
    { projectName: name }
  );
  return mapProductToAssessment(organizationId, row);
}

export async function getProductAssessment(
  orgId: string,
  projectId: string
): Promise<ProductAssessment | undefined> {
  try {
    const row = await apiGet<ApiProductAssessment>(
      `/api/org-assessments/${orgId}/products/${projectId}`
    );
    return mapProductToAssessment(orgId, row);
  } catch {
    return undefined;
  }
}

export async function saveProductAssessment(
  orgId: string,
  projectId: string,
  partial: Partial<Omit<ProductAssessment, "id" | "organizationId" | "name" | "createdAt">>
): Promise<ProductAssessment | undefined> {
  try {
    const body = { answers: {} as Record<string, unknown> };
    if (partial.map) body.answers.map = partial.map;
    if (partial.measure) body.answers.measure = partial.measure;
    if (partial.manage) body.answers.manage = partial.manage;

    const row = await apiPatch<ApiProductAssessment>(
      `/api/org-assessments/${orgId}/products/${projectId}`,
      body
    );
    return mapProductToAssessment(orgId, row);
  } catch {
    return undefined;
  }
}

export { emptyPlaybook };
