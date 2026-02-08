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
import { ExportPanel } from "@/components/results/shared/ExportPanel";

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Results</h1>
        <p className="text-muted-foreground mt-1">
          Assessment results and governance requirements
        </p>
      </div>

      <Tabs defaultValue="risk" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1">
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="release">Release Criteria</TabsTrigger>
          <TabsTrigger value="controls">Technical Controls</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="nist">NIST Mapping</TabsTrigger>
          <TabsTrigger value="checklist">Implementation Checklist</TabsTrigger>
          <TabsTrigger value="servicecard">Service Card</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring Spec</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="mt-6">
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
        </TabsContent>

        <TabsContent value="release" className="mt-6">
          <ReleaseCriteriaMatrix
            releaseCriteria={result.releaseCriteria}
          />
        </TabsContent>

        <TabsContent value="controls" className="mt-6">
          <TechnicalControls
            technicalControls={result.technicalControls}
          />
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <ComplianceRequirements
            complianceRequirements={result.complianceRequirements}
          />
        </TabsContent>

        <TabsContent value="nist" className="mt-6">
          <ProductNistMapping nistMapping={result.nistMapping} />
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <ImplementationChecklist
            implementationChecklist={result.implementationChecklist}
          />
        </TabsContent>

        <TabsContent value="servicecard" className="mt-6">
          <ServiceCard serviceCard={result.serviceCard} />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <MonitoringSpec monitoringSpec={result.monitoringSpec} />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ExportPanel
            type="product"
            exportUrl={`/api/org-assessments/${id}/products/${pid}/export`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
