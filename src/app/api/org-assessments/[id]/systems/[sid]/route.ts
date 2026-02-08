import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { computeSystemRiskTier } from "@/lib/scoring/system-risk-scorer";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, sid } = await params;
  const assessment = await prisma.orgAssessment.findFirst({ where: { id, userId } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const system = await prisma.aISystem.findFirst({ where: { id: sid, assessmentId: id } });
  if (!system) return NextResponse.json({ error: "System not found" }, { status: 404 });

  return NextResponse.json(system);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, sid } = await params;
  const assessment = await prisma.orgAssessment.findFirst({ where: { id, userId } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const riskTier = computeSystemRiskTier(body);

  const system = await prisma.aISystem.update({
    where: { id: sid },
    data: { ...body, riskTier },
  });

  return NextResponse.json(system);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, sid } = await params;
  const assessment = await prisma.orgAssessment.findFirst({ where: { id, userId } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.aISystem.delete({ where: { id: sid } });

  return NextResponse.json({ success: true });
}
