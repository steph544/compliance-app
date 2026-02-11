import type { SectionContent, ContentBlock } from "./types";

type OrgResult = Record<string, unknown> | null;
type OrgAssessment = {
  orgName: string;
  result: OrgResult;
  answers: Record<string, unknown> | null;
  products?: Array<{
    projectName: string;
    result: { riskTier?: string } | null;
  }>;
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

export function getOrgSectionContent(
  sectionId: string,
  assessment: OrgAssessment
): SectionContent | null {
  const result = assessment.result ?? {};
  const answers = assessment.answers ?? {};

  switch (sectionId) {
    case "summary": {
      const riskTier = (result.riskTier as string) ?? "Unknown";
      const riskScore = (result.riskScore as number) ?? 0;
      const drivers = (result.riskDrivers as Array<{ factor: string; contribution?: number; explanation: string }>) ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "Risk Summary"),
        text(`Organization: ${assessment.orgName}`),
        text(`Risk Tier: ${riskTier}`),
        text(`Risk Score: ${riskScore}`),
        heading(2, "Risk Drivers"),
        ...drivers.slice(0, 10).flatMap((d) => [
          heading(3, d.factor.replace(/_/g, " ")),
          text(`${d.explanation} (contribution: ${d.contribution ?? d.scoreContribution ?? 0})`),
        ]),
      ];
      return { title: "Risk Summary", blocks };
    }
    case "heatmap": {
      const heatmap = (result.readinessHeatmap as { dimensions?: Array<{ name: string; score: number; recommendations?: string[] }> }) ?? {};
      const dimensions = heatmap.dimensions ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "Readiness Heatmap"),
        table(
          ["Dimension", "Score", "Recommendations"],
          dimensions.map((d) => [
            d.name,
            String(d.score),
            (d.recommendations ?? []).join("; "),
          ])
        ),
      ];
      return { title: "Readiness Heatmap", blocks };
    }
    case "nist": {
      const mapping = (result.nistMapping as Array<{ controlId: string; controlName?: string; designation?: string; nistRef?: string }>) ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "NIST Compliance"),
        table(
          ["Control ID", "Control Name", "Designation", "NIST Ref"],
          mapping.map((m) => [
            m.controlId ?? "",
            m.controlName ?? "",
            m.designation ?? "",
            m.nistRef ?? "",
          ])
        ),
      ];
      return { title: "NIST Compliance", blocks };
    }
    case "monitoring": {
      const plan = (result.monitoringPlan as { metrics?: Array<{ name: string; description?: string }>; cadence?: string }) ?? {};
      const runbook = (result.operationsRunbook as {
        alerts?: Array<{ name: string; condition?: string; severity?: string; action?: string }>;
        timelines?: string[];
      }) ?? {};
      const metrics = plan.metrics ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "Monitoring Plan"),
        text(`Review cadence: ${plan.cadence ?? "Not specified"}`),
        heading(2, "Metrics"),
        table(
          ["Metric", "Description"],
          metrics.map((m) => [m.name, m.description ?? ""])
        ),
      ];
      if (runbook.alerts?.length) {
        blocks.push(
          heading(2, "Alerts"),
          table(
            ["Alert", "Condition", "Severity", "Action"],
            runbook.alerts.map((a) => [a.name, a.condition ?? "", a.severity ?? "", a.action ?? ""])
          )
        );
      }
      if (runbook.timelines?.length) {
        blocks.push(heading(2, "Timelines"), text(runbook.timelines.join("\n")));
      }
      return { title: "Monitoring Plan", blocks };
    }
    case "policies": {
      const drafts = (result.policyDrafts as {
        responsibleAI?: { title: string; sections?: Array<{ heading: string; content: string }> };
        transparency?: { title: string; sections?: Array<{ heading: string; content: string }> };
      }) ?? {};
      const blocks: ContentBlock[] = [
        heading(1, "Policy Drafts"),
        ...(drafts.responsibleAI
          ? [
              heading(2, drafts.responsibleAI.title),
              ...(drafts.responsibleAI.sections ?? []).flatMap((s) => [
                heading(3, s.heading),
                text(s.content),
              ]),
            ]
          : []),
        ...(drafts.transparency
          ? [
              heading(2, drafts.transparency.title),
              ...(drafts.transparency.sections ?? []).flatMap((s) => [
                heading(3, s.heading),
                text(s.content),
              ]),
            ]
          : []),
      ];
      return { title: "Policy Drafts", blocks };
    }
    case "products": {
      const products = assessment.products ?? [];
      const blocks: ContentBlock[] = [
        heading(1, "Product Assessments"),
        table(
          ["Product", "Risk Tier"],
          products.map((p) => [
            p.projectName ?? "Unknown",
            p.result?.riskTier ?? "N/A",
          ])
        ),
      ];
      return { title: "Product Assessments", blocks };
    }
    default:
      return null;
  }
}
