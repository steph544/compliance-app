import type { SectionContent, ContentBlock } from "./types";

type ProductResult = Record<string, unknown> | null;
type ProductAssessment = {
  projectName: string;
  result: ProductResult;
  answers: Record<string, unknown> | null;
};

function text(s: string): ContentBlock {
  return { type: "text", content: s };
}
function heading(level: 1 | 2 | 3, s: string): ContentBlock {
  return { type: "heading", level, content: s };
}
function table(headers: string[], rows: string[][]): ContentBlock {
  return { type: "table", headers, rows };
}

export function getProductSectionContent(
  sectionId: string,
  assessment: ProductAssessment
): SectionContent | null {
  const result = assessment.result ?? {};

  switch (sectionId) {
    case "risk": {
      const riskTier = (result.riskTier as string) ?? "Unknown";
      const riskScore = (result.riskScore as number) ?? 0;
      const drivers = (result.riskDrivers as Array<{ factor: string; contribution?: number; explanation: string }>) ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "Risk Assessment"),
        text(`Product: ${assessment.projectName}`),
        text(`Risk Tier: ${riskTier}`),
        text(`Risk Score: ${riskScore}`),
        heading(2, "Risk Drivers"),
        ...drivers.slice(0, 10).flatMap((d) => [
          heading(3, d.factor.replace(/_/g, " ")),
          text(`${d.explanation}`),
        ]),
      ];
      return { title: "Risk Assessment", blocks };
    }
    case "release": {
      const criteria = (result.releaseCriteriaMatrix ?? result.releaseCriteria ?? []) as Array<{
        metric?: string;
        type?: string;
        threshold?: string;
        dataSource?: string;
        owner?: string;
      }>;
      const blocks: ContentBlock[] = [
        heading(1, "Release Criteria"),
        table(
          ["Metric", "Type", "Threshold", "Data Source", "Owner"],
          criteria.map((c) => [
            c.metric ?? "",
            c.type ?? "",
            c.threshold ?? "",
            c.dataSource ?? "",
            c.owner ?? "",
          ])
        ),
      ];
      return { title: "Release Criteria", blocks };
    }
    case "controls": {
      const controls = (result.technicalControls as Array<{ controlId?: string; name?: string; designation?: string }>) ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "Technical Controls"),
        table(
          ["Control ID", "Name", "Designation"],
          controls.map((c) => [c.controlId ?? "", c.name ?? "", c.designation ?? ""])
        ),
      ];
      return { title: "Technical Controls", blocks };
    }
    case "compliance": {
      const reqs = (result.complianceRequirements as Array<{ requirement?: string; regulation?: string; status?: string }>) ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "Regulatory Compliance"),
        table(
          ["Requirement", "Regulation", "Status"],
          reqs.map((r) => [r.requirement ?? "", r.regulation ?? "", r.status ?? ""])
        ),
      ];
      return { title: "Regulatory Compliance", blocks };
    }
    case "nist": {
      const mapping = (result.nistMapping as Array<{ controlId?: string; controlName?: string; designation?: string }>) ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "NIST Mapping"),
        table(
          ["Control ID", "Control Name", "Designation"],
          mapping.map((m) => [m.controlId ?? "", m.controlName ?? "", m.designation ?? ""])
        ),
      ];
      return { title: "NIST Mapping", blocks };
    }
    case "checklist": {
      const items = (result.implementationChecklist as Array<{ item?: string; owner?: string; status?: string }>) ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "Implementation Checklist"),
        table(
          ["Item", "Owner", "Status"],
          items.map((i) => [i.item ?? "", i.owner ?? "", i.status ?? ""])
        ),
      ];
      return { title: "Implementation Checklist", blocks };
    }
    case "evidence":
      return {
        title: "Evidence",
        blocks: [heading(1, "Evidence"), text("Evidence items are stored in the system. Review the Evidence tab for details.")],
      };
    case "audit":
      return {
        title: "Audit log",
        blocks: [heading(1, "Audit log"), text("Audit log entries are stored in the system. Review the Audit log tab for details.")],
      };
    case "servicecard": {
      const card = (result.serviceCard as { purpose?: string; modelType?: string; knownLimitations?: string[] }) ?? {};
      const blocks: ContentBlock[] = [
        heading(1, "Service Card"),
        text(`Purpose: ${card.purpose ?? "N/A"}`),
        text(`Model Type: ${card.modelType ?? "N/A"}`),
        heading(2, "Known Limitations"),
        text((card.knownLimitations ?? []).join("; ") || "None specified"),
      ];
      return { title: "Service Card", blocks };
    }
    case "monitoring": {
      const spec = (result.monitoringSpec as { metrics?: Array<{ name: string; target?: string }> }) ?? {};
      const metrics = spec.metrics ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "Monitoring Spec"),
        table(
          ["Metric", "Target"],
          metrics.map((m) => [m.name, m.target ?? ""])
        ),
      ];
      return { title: "Monitoring Spec", blocks };
    }
    default:
      return null;
  }
}
