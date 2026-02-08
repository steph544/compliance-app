import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardView } from "@/components/dashboard/DashboardView";
import type { DashboardAssessment } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let assessments: Awaited<ReturnType<typeof prisma.orgAssessment.findMany>>;
  try {
    assessments = await prisma.orgAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        products: true,
        result: { select: { riskTier: true, riskScore: true } },
      },
    });
  } catch (err) {
    console.error("Dashboard failed to load assessments:", err);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assessments</h1>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-10 text-center">
            <p className="text-destructive font-medium">Failed to load assessments</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Check your connection and try again. If the problem continues, check the server logs.
            </p>
            <form action="/dashboard" method="get" className="mt-4">
              <Button type="submit" variant="outline" size="sm">
                Retry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAssessments = assessments.length;
  const completedAssessments = assessments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const totalProducts = assessments.reduce(
    (sum, a) => sum + a.products.length,
    0
  );
  const riskDistribution = assessments.reduce(
    (acc: Record<string, number>, a) => {
      if (a.result?.riskTier) {
        acc[a.result.riskTier] = (acc[a.result.riskTier] ?? 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const serializedAssessments: DashboardAssessment[] = assessments.map((a) => ({
    id: a.id,
    orgName: a.orgName,
    answers: a.answers as Record<string, unknown> | null,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    result: a.result ? { riskTier: a.result.riskTier, riskScore: a.result.riskScore } : null,
    products: a.products.map((p) => ({
      id: p.id,
      projectName: p.projectName,
      answers: p.answers as Record<string, unknown> | null,
      status: p.status,
    })),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <Link href="/org/new">
          <Button size="sm">New assessment</Button>
        </Link>
      </div>

      {assessments.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground text-sm">
              No assessments yet. Create your first organization assessment to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DashboardView
          assessments={serializedAssessments}
          totalAssessments={totalAssessments}
          completedAssessments={completedAssessments}
          totalProducts={totalProducts}
          riskDistribution={riskDistribution}
        />
      )}
    </div>
  );
}
