import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductRiskAssessment } from "@/components/results/product/ProductRiskAssessment";
import { ReleaseCriteriaMatrix } from "@/components/results/product/ReleaseCriteriaMatrix";
import { TechnicalControls } from "@/components/results/product/TechnicalControls";
import { ComplianceRequirements } from "@/components/results/product/ComplianceRequirements";
import { ProductNistMapping } from "@/components/results/product/ProductNistMapping";
import { ImplementationChecklist } from "@/components/results/product/ImplementationChecklist";
import { ServiceCard } from "@/components/results/product/ServiceCard";
import { MonitoringSpec } from "@/components/results/product/MonitoringSpec";
import { EvidenceSection } from "@/components/results/product/EvidenceSection";
import { ReleaseApprovalCard } from "@/components/results/product/ReleaseApprovalCard";
import { AuditLogSection } from "@/components/results/product/AuditLogSection";
import { ReassessmentSection } from "@/components/results/product/ReassessmentSection";
import { ExportPanel } from "@/components/results/shared/ExportPanel";
import { PRODUCT_DOWNLOAD_SECTIONS } from "@/lib/download-sections";
import { TabContentFadeIn } from "@/components/results/shared/TabContentFadeIn";
import { DecisionLogSummary } from "@/components/results/shared/DecisionLogSummary";
import { RecomputeProductButton } from "@/components/results/product/RecomputeProductButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductResultsPage({
  params,
}: {
  params: Promise<{ id: string; pid: string }>;
}) {
  const { userId } = await auth();
  const { id, pid } = await params;

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          You must be signed in to view results.
        </p>
      </div>
    );
  }

  const product = await prisma.productAssessment.findFirst({
    where: {
      id: pid,
      orgAssessmentId: id,
      orgAssessment: { userId },
    },
    include: {
      result: true,
      orgAssessment: {
        include: {
          result: {
            select: { riskTier: true },
          },
        },
      },
    },
  });

  if (!product || !product.result) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">No Results Available</h2>
          <p className="text-muted-foreground">
            {!product
              ? "Product assessment not found."
              : "Results have not been generated yet for this product assessment."}
          </p>
        </div>
      </div>
    );
  }

  const result = product.result as any;
  const orgRiskTier = product.orgAssessment?.result?.riskTier ?? "Unknown";

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Results</h1>
          <p className="text-muted-foreground mt-1">
            Assessment results and governance requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RecomputeProductButton orgAssessmentId={id} productId={pid} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/org/${id}/product/${pid}/wizard`} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit assessment
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="risk" className="w-full">
        <TabsList variant="line" className="w-full flex flex-wrap h-auto gap-1">
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="release">Release Criteria</TabsTrigger>
          <TabsTrigger value="controls">Technical Controls</TabsTrigger>
          <TabsTrigger value="compliance">Regulatory Compliance</TabsTrigger>
          <TabsTrigger value="nist">NIST Mapping</TabsTrigger>
          <TabsTrigger value="checklist">Implementation Checklist</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
          <TabsTrigger value="servicecard">Service Card</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring Spec</TabsTrigger>
          <TabsTrigger value="export">Download</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="mt-6">
          <TabContentFadeIn>
            <div className="space-y-6">
              <ProductRiskAssessment
                result={{
                  riskTier: result.riskTier,
                  riskScore: result.riskScore,
                  riskDrivers: result.riskDrivers,
                  fitForAiResult: result.fitForAiResult,
                  stakeholderMap: result.stakeholderMap,
                }}
                orgRiskTier={orgRiskTier}
              />
              <DecisionLogSummary decisionLog={result.decisionLog} scope="product" />
            </div>
          </TabContentFadeIn>
        </TabsContent>

        <TabsContent value="release" className="mt-6">
          <TabContentFadeIn>
            <ReleaseCriteriaMatrix
              releaseCriteria={result.releaseCriteriaMatrix ?? result.releaseCriteria ?? []}
            />
          </TabContentFadeIn>
        </TabsContent>

        <TabsContent value="controls" className="mt-6">
          <TabContentFadeIn>
            <TechnicalControls
              technicalControls={result.technicalControls}
              orgId={id}
              productId={pid}
            />
          </TabContentFadeIn>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <TabContentFadeIn>
            <ComplianceRequirements
              complianceRequirements={result.complianceRequirements}
            />
          </TabContentFadeIn>
        </TabsContent>

        <TabsContent value="nist" className="mt-6">
          <TabContentFadeIn>
            <ProductNistMapping nistMapping={result.nistMapping} />
          </TabContentFadeIn>
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <TabContentFadeIn>
            <ImplementationChecklist
              implementationChecklist={result.implementationChecklist}
              orgAssessmentId={id}
              productId={pid}
            />
          </TabContentFadeIn>
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <EvidenceSection orgId={id} productId={pid} />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogSection orgId={id} productId={pid} />
        </TabsContent>

        <TabsContent value="reassessment" className="mt-6">
          <ReassessmentSection orgId={id} productId={pid} />
        </TabsContent>

        <TabsContent value="servicecard" className="mt-6">
          <TabContentFadeIn>
            <ServiceCard serviceCard={result.serviceCard} />
          </TabContentFadeIn>
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <TabContentFadeIn>
            <MonitoringSpec monitoringSpec={result.monitoringSpec} />
          </TabContentFadeIn>
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <TabContentFadeIn>
            <ExportPanel
              type="product"
              exportUrl={`/api/org-assessments/${id}/products/${pid}/export`}
              sections={PRODUCT_DOWNLOAD_SECTIONS}
            />
          </TabContentFadeIn>
        </TabsContent>
      </Tabs>
    </div>
  );
}
