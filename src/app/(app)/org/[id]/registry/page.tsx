import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function riskTierColor(tier: string) {
  switch (tier) {
    case "LOW":
      return "bg-green-100 text-green-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800";
    case "HIGH":
      return "bg-red-100 text-red-800";
    case "REGULATED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function statusColor(status: string) {
  switch (status) {
    case "PRODUCTION":
      return "bg-green-100 text-green-800";
    case "PILOT":
      return "bg-blue-100 text-blue-800";
    case "PLANNED":
      return "bg-gray-100 text-gray-800";
    case "DECOMMISSIONING":
      return "bg-orange-100 text-orange-800";
    case "DECOMMISSIONED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default async function RegistryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const systems = await prisma.aISystem.findMany({
    where: { assessmentId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI System Registry
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage all AI systems in your organization
          </p>
        </div>
        <Link href={`/org/${id}/registry/new`}>
          <Button>Add AI System</Button>
        </Link>
      </div>

      {/* Systems List */}
      {systems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No AI systems registered yet. Add your first system to begin
              tracking.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {systems.map((system: any) => (
            <Card key={system.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{system.name}</CardTitle>
                    {system.vendor && (
                      <p className="mt-1 text-sm text-gray-500">
                        Vendor: {system.vendor}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={statusColor(system.status)}
                    >
                      {system.status}
                    </Badge>
                    {system.riskTier && (
                      <Badge
                        variant="secondary"
                        className={riskTierColor(system.riskTier)}
                      >
                        {system.riskTier} RISK
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{system.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Department: {system.department}</span>
                  <span>Owner: {system.businessOwner}</span>
                  <span>Type: {system.vendorType}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
