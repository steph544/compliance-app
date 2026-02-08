import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AssessmentCard } from "@/components/dashboard/AssessmentCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const assessments = await prisma.orgAssessment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      products: true,
      result: { select: { riskTier: true } },
    },
  });

  // Compute aggregate stats
  const totalAssessments = assessments.length;
  const completedAssessments = assessments.filter(
    (a: any) => a.status === "COMPLETED"
  ).length;
  const totalProducts = assessments.reduce(
    (sum: number, a: any) => sum + a.products.length,
    0
  );
  const riskDistribution = assessments.reduce(
    (acc: Record<string, number>, a: any) => {
      if (a.result?.riskTier) {
        acc[a.result.riskTier] = (acc[a.result.riskTier] ?? 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Governance Platform</h1>
        <Link href="/org/new">
          <Button>New Organization Assessment</Button>
        </Link>
      </div>

      {/* Stats */}
      {assessments.length > 0 && (
        <div className="mb-8">
          <DashboardStats
            totalAssessments={totalAssessments}
            completedAssessments={completedAssessments}
            totalProducts={totalProducts}
            riskDistribution={riskDistribution}
          />
        </div>
      )}

      {/* Assessment List */}
      {assessments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No assessments yet. Create your first organization assessment to
              get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {assessments.map((assessment: any, index: number) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
