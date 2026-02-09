import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { OrgRiskSummary } from "@/components/results/org/OrgRiskSummary";
import { ReadinessHeatmap } from "@/components/results/org/ReadinessHeatmap";
import { OrgNistMapping } from "@/components/results/org/OrgNistMapping";
import { MonitoringPlan } from "@/components/results/org/MonitoringPlan";
import { PolicyDrafts } from "@/components/results/org/PolicyDrafts";
import { ProductAssessmentsList } from "@/components/results/org/ProductAssessmentsList";
import { ExportPanel } from "@/components/results/org/ExportPanel";
import { RecomputeButton } from "@/components/results/org/RecomputeButton";
import type { MonitoringPlanData, OperationsRunbookData } from "@/lib/scoring/types";

const VALID_SECTIONS = [
  "summary",
  "heatmap",
  "nist",
  "monitoring",
  "policies",
  "products",
  "export",
] as const;
const SECTION_TITLES: Record<(typeof VALID_SECTIONS)[number], string> = {
  summary: "Risk summary",
  heatmap: "Readiness Heatmap",
  nist: "NIST Compliance",
  monitoring: "Monitoring Plan",
  policies: "Policy Drafts",
  products: "Product Assessments",
  export: "Export",
};

export const dynamic = "force-dynamic";

export default async function OrgResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const assessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
    include: {
      result: {
        include: { implementation: true },
      },
      products: {
        include: {
          result: {
            select: { riskTier: true },
          },
        },
      },
    },
  });

  // Fetch NIST hierarchy for the compliance tracker
  const nistHierarchy = await prisma.nistFunction.findMany({
    include: {
      categories: {
        include: { subcategories: true },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  if (!assessment || !assessment.result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Results Not Found</h2>
          <p className="text-muted-foreground">
            This assessment has not been completed yet, or you do not have
            access to view it.
          </p>
        </div>
      </div>
    );
  }

  const { section: sectionParam } = await searchParams;
  const section = VALID_SECTIONS.includes(sectionParam as (typeof VALID_SECTIONS)[number])
    ? (sectionParam as (typeof VALID_SECTIONS)[number])
    : "summary";

  const result = assessment.result as Record<string, unknown>;
  const answers = assessment.answers as Record<string, unknown> | null;
  const primaryCloudInfrastructure = (answers?.step7 as { primaryCloudInfrastructure?: "aws" | "azure" | "gcp" | "multi" | "on_prem_only" | "hybrid" } | undefined)?.primaryCloudInfrastructure;

  const sectionTitle = SECTION_TITLES[section];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{sectionTitle}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {section === "summary" && "Organization risk and driver summary."}
            {section !== "summary" && "Review your AI governance assessment findings and recommendations."}
          </p>
        </div>
        <RecomputeButton assessmentId={id} className="shrink-0" />
      </div>

      {section === "summary" && (
        <OrgRiskSummary
          result={{
            riskTier: result.riskTier as "LOW" | "MEDIUM" | "HIGH" | "REGULATED",
            riskScore: result.riskScore as number,
            riskDrivers: result.riskDrivers as Array<{
              factor: string;
              contribution?: number;
              scoreContribution?: number;
              explanation: string;
            }>,
          }}
        />
      )}

      {section === "heatmap" && (
        <ReadinessHeatmap
          heatmap={
            result.readinessHeatmap as {
              dimensions: Array<{
                name: string;
                score: number;
                recommendation: string;
              }>;
              recommendations: string[];
            }
          }
        />
      )}

      {section === "nist" && (
        <OrgNistMapping
          nistMapping={
            result.nistMapping as Array<{
              finding: string;
              nistRef: string;
              controlId: string;
              controlName: string;
              designation: string;
              evidence: string[];
              description: string;
              implementationSteps: string[];
              implementationLevel: string;
              controlType: string;
              implementationVendor?: "aws" | "azure";
              implementationService?: string;
            }>
            }
          nistHierarchy={nistHierarchy}
          assessmentId={id}
          primaryCloudInfrastructure={primaryCloudInfrastructure}
        />
      )}

      {section === "monitoring" && (
        <MonitoringPlan
          key={`monitoring-${String((result as { computedAt?: unknown }).computedAt ?? id)}`}
          assessmentId={id}
          monitoringPlan={result.monitoringPlan as MonitoringPlanData}
          operationsRunbook={result.operationsRunbook as OperationsRunbookData}
          riskTier={result.riskTier as string | undefined}
          requiredControlsCount={
            Array.isArray(result.controlSelections)
              ? (result.controlSelections as { designation?: string }[]).filter(
                  (s) => s.designation === "REQUIRED"
                ).length
              : undefined
          }
        />
      )}

      {section === "policies" && (
        <PolicyDrafts
          policyDrafts={
            result.policyDrafts as {
              responsibleAI: {
                title: string;
                sections: Array<{ heading: string; content: string }>;
              };
              transparency: {
                title: string;
                sections: Array<{ heading: string; content: string }>;
              };
            }
          }
          assessmentId={id}
        />
      )}

      {section === "products" && (
        <ProductAssessmentsList
          products={assessment.products.map((p: any) => {
            const answers = p.answers as Record<string, unknown> | null | undefined;
            const step1 = answers?.step1 as { projectName?: string } | undefined;
            const projectName = step1?.projectName?.trim() || p.projectName;
            return {
              id: p.id,
              projectName,
              status: p.status,
              result: p.result
                ? { riskTier: p.result.riskTier as "LOW" | "MEDIUM" | "HIGH" | "REGULATED" }
                : null,
            };
          })}
          orgId={id}
        />
      )}

      {section === "export" && <ExportPanel assessmentId={id} type="org" />}
    </div>
  );
}
