import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessments = await prisma.orgAssessment.findMany({
    where: { userId },
    include: {
      result: { select: { riskTier: true, riskScore: true } },
      products: { select: { id: true, projectName: true, status: true, result: { select: { riskTier: true } } } },
      _count: { select: { aiSystems: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(assessments);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { orgName } = body;

  if (!orgName || typeof orgName !== "string") {
    return NextResponse.json({ error: "orgName is required" }, { status: 400 });
  }

  const assessment = await prisma.orgAssessment.create({
    data: { userId, orgName, answers: {} },
  });

  return NextResponse.json(assessment, { status: 201 });
}
