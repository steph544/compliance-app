/** Section config for downloadable reports. Used by Download panel and export APIs. */

export const ORG_DOWNLOAD_SECTIONS = [
  { id: "summary", title: "Risk summary" },
  { id: "heatmap", title: "Readiness Heatmap" },
  { id: "nist", title: "NIST Compliance" },
  { id: "monitoring", title: "Monitoring Plan" },
  { id: "policies", title: "Policy Drafts" },
  { id: "products", title: "Product Assessments" },
] as const;

export const PRODUCT_DOWNLOAD_SECTIONS = [
  { id: "risk", title: "Risk Assessment" },
  { id: "release", title: "Release Criteria" },
  { id: "controls", title: "Technical Controls" },
  { id: "compliance", title: "Regulatory Compliance" },
  { id: "nist", title: "NIST Mapping" },
  { id: "checklist", title: "Implementation Checklist" },
  { id: "evidence", title: "Evidence" },
  { id: "audit", title: "Audit log" },
  { id: "servicecard", title: "Service Card" },
  { id: "monitoring", title: "Monitoring Spec" },
] as const;

export type OrgSectionId = (typeof ORG_DOWNLOAD_SECTIONS)[number]["id"];
export type ProductSectionId = (typeof PRODUCT_DOWNLOAD_SECTIONS)[number]["id"];

const ORG_IDS = new Set(ORG_DOWNLOAD_SECTIONS.map((s) => s.id));
const PRODUCT_IDS = new Set(PRODUCT_DOWNLOAD_SECTIONS.map((s) => s.id));

export function getOrgSectionTitle(id: string): string | undefined {
  return ORG_DOWNLOAD_SECTIONS.find((s) => s.id === id)?.title;
}

export function getProductSectionTitle(id: string): string | undefined {
  return PRODUCT_DOWNLOAD_SECTIONS.find((s) => s.id === id)?.title;
}

export function parseSectionIds(
  type: "org" | "product",
  raw: string | string[] | null | undefined
): string[] {
  const validIds = type === "org" ? ORG_IDS : PRODUCT_IDS;
  const arr = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  return arr.filter((id) => validIds.has(id));
}
