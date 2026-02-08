import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ImplementationWalkthrough } from "@/components/governance-implementation/ImplementationWalkthrough";

export const dynamic = "force-dynamic";

export default async function GovernanceImplementationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const assessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
    include: { result: true },
  });

  if (!assessment?.result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Results Not Found</h2>
          <p className="text-muted-foreground">
            Complete the organization assessment first to generate the
            governance blueprint.
          </p>
        </div>
      </div>
    );
  }

  const blueprint = assessment.result.governanceBlueprint as Record<
    string,
    unknown
  >;

  return (
    <ImplementationWalkthrough assessmentId={id} blueprint={blueprint} />
  );
}
