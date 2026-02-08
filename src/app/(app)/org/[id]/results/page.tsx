import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { OrgRiskSummary } from "@/components/results/org/OrgRiskSummary";
import { ReadinessHeatmap } from "@/components/results/org/ReadinessHeatmap";
import { GovernanceBlueprint } from "@/components/results/org/GovernanceBlueprint";
import { OrgNistMapping } from "@/components/results/org/OrgNistMapping";
import { OrgControlChecklist } from "@/components/results/org/OrgControlChecklist";
import { MonitoringPlan } from "@/components/results/org/MonitoringPlan";
import { PolicyDrafts } from "@/components/results/org/PolicyDrafts";
import { ProductAssessmentsList } from "@/components/results/org/ProductAssessmentsList";
import { ExportPanel } from "@/components/results/org/ExportPanel";

export const dynamic = "force-dynamic";

export default async function OrgResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const result = assessment.result as Record<string, unknown>;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Assessment Results</h1>
        <p className="text-muted-foreground mt-1">
          Review your AI governance assessment findings and recommendations.
        </p>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="flex flex-wrap w-full h-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="heatmap">Readiness Heatmap</TabsTrigger>
          <TabsTrigger value="blueprint">Governance Blueprint</TabsTrigger>
          <TabsTrigger value="nist">NIST Compliance</TabsTrigger>
          <TabsTrigger value="controls">Controls Checklist</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring Plan</TabsTrigger>
          <TabsTrigger value="policies">Policy Drafts</TabsTrigger>
          <TabsTrigger value="products">Product Assessments</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <OrgRiskSummary
            result={{
              riskTier: result.riskTier as "LOW" | "MEDIUM" | "HIGH" | "REGULATED",
              riskScore: result.riskScore as number,
              riskDrivers: result.riskDrivers as Array<{
                factor: string;
                scoreContribution: number;
                explanation: string;
              }>,
            }}
          />
        </TabsContent>

        <TabsContent value="heatmap" className="mt-6">
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
        </TabsContent>

        <TabsContent value="blueprint" className="mt-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Governance Blueprint</h3>
              {assessment.result.implementation && (
                <p className="text-sm text-muted-foreground">
                  Implementation:{" "}
                  {(assessment.result.implementation.sections as Array<{ status: string }>).filter(
                    (s) => s.status === "COMPLETED"
                  ).length}
                  /
                  {(assessment.result.implementation.sections as Array<{ status: string }>).length}{" "}
                  sections completed
                </p>
              )}
            </div>
            <Link href={`/org/${id}/governance`}>
              <Button>
                {assessment.result.implementation
                  ? "Continue Implementation"
                  : "Begin Implementation"}
              </Button>
            </Link>
          </div>
          <GovernanceBlueprint
            blueprint={
              result.governanceBlueprint as {
                threeLoD: Array<{
                  line: number;
                  role: string;
                  description: string;
                  assignedTo: string;
                }>;
                roles: Array<{
                  title: string;
                  description: string;
                  line: number;
                }>;
                committees: Array<{
                  name: string;
                  members: string[];
                  cadence: string;
                  charter: string;
                }>;
                decisionRights: Array<{
                  decision: string;
                  responsible: string;
                  accountable: string;
                  consulted: string;
                  informed: string;
                }>;
                reviewCadence: string;
                humanAiPatterns: Array<{
                  pattern: string;
                  description: string;
                  whenToApply: string;
                }>;
                whistleblower: {
                  channel: string;
                  process: string;
                  sla: string;
                };
                escalation: Array<{
                  level: number;
                  trigger: string;
                  owner: string;
                  timeline: string;
                }>;
              }
            }
          />
        </TabsContent>

        <TabsContent value="nist" className="mt-6">
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
              }>
            }
            nistHierarchy={nistHierarchy}
            assessmentId={id}
          />
        </TabsContent>

        <TabsContent value="controls" className="mt-6">
          <OrgControlChecklist
            controlSelections={
              result.controlSelections as Array<{
                controlId: string;
                designation: "REQUIRED" | "RECOMMENDED" | "OPTIONAL";
                owner: string;
                reasoning: string;
              }>
            }
          />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <MonitoringPlan
            monitoringPlan={
              result.monitoringPlan as {
                metrics: Array<{
                  name: string;
                  description: string;
                  target: string;
                  frequency: string;
                }>;
                cadence: string;
                alerts: Array<{
                  name: string;
                  condition: string;
                  severity: string;
                  action: string;
                }>;
              }
            }
            operationsRunbook={
              result.operationsRunbook as {
                alerts: Array<{
                  name: string;
                  condition: string;
                  severity: string;
                  action: string;
                }>;
                incidentTriage: Array<{
                  severity: string;
                  criteria: string;
                  responseTime: string;
                  owner: string;
                }>;
                escalationTriggers: Array<{
                  trigger: string;
                  escalateTo: string;
                  timeline: string;
                }>;
                roles: Array<{
                  role: string;
                  responsibilities: string;
                }>;
                timelines: string[];
              }
            }
          />
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
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
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ProductAssessmentsList
            products={assessment.products.map((p: any) => ({
              id: p.id,
              projectName: (p as unknown as Record<string, string>).projectName,
              status: (p as unknown as Record<string, string>).status,
              result: p.result
                ? { riskTier: p.result.riskTier as "LOW" | "MEDIUM" | "HIGH" | "REGULATED" }
                : null,
            }))}
            orgId={id}
          />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ExportPanel assessmentId={id} type="org" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
