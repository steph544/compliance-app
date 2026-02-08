import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { computeSystemRiskTier } from "@/lib/scoring/system-risk-scorer";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assessment = await prisma.orgAssessment.findFirst({ where: { id, userId } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const systems = await prisma.aISystem.findMany({
    where: { assessmentId: id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(systems);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assessment = await prisma.orgAssessment.findFirst({ where: { id, userId } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();

  // Auto-compute risk tier
  const riskResult = computeSystemRiskTier(body);
  const riskTier = riskResult.tier;

  const system = await prisma.aISystem.create({
    data: {
      assessmentId: id,
      name: body.name,
      description: body.description,
      vendor: body.vendor,
      vendorType: body.vendorType || "INTERNAL",
      aiType: body.aiType || [],
      purpose: body.purpose || "INTERNAL_TOOL",
      department: body.department || "",
      businessOwner: body.businessOwner || "",
      technicalOwner: body.technicalOwner,
      dataTypes: body.dataTypes || [],
      hasAutomatedDecisions: body.hasAutomatedDecisions || false,
      affectsExternalUsers: body.affectsExternalUsers || false,
      riskTier,
      riskNotes: body.riskNotes,
      modelType: body.modelType,
      modelVersion: body.modelVersion,
      modelProvider: body.modelProvider,
      trainingDate: body.trainingDate ? new Date(body.trainingDate) : null,
      dataResidency: body.dataResidency || [],
      status: body.status || "PLANNED",
      deploymentType: body.deploymentType,
      goLiveDate: body.goLiveDate ? new Date(body.goLiveDate) : null,
      lastReviewDate: body.lastReviewDate ? new Date(body.lastReviewDate) : null,
      nextReviewDate: body.nextReviewDate ? new Date(body.nextReviewDate) : null,
      hasDocumentation: body.hasDocumentation || false,
      hasImpactAssessment: body.hasImpactAssessment || false,
      hasMonitoring: body.hasMonitoring || false,
      hasIncidentPlan: body.hasIncidentPlan || false,
      applicableLaws: body.applicableLaws || [],
      prohibitedUses: body.prohibitedUses,
      driftThresholds: body.driftThresholds,
      complianceNotes: body.complianceNotes,
    },
  });

  return NextResponse.json(system, { status: 201 });
}
