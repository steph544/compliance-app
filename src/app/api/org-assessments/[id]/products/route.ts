import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assessment = await prisma.orgAssessment.findFirst({ where: { id, userId } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const products = await prisma.productAssessment.findMany({
    where: { orgAssessmentId: id },
    include: { result: { select: { riskTier: true, riskScore: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(products);
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

  const product = await prisma.productAssessment.create({
    data: {
      orgAssessmentId: id,
      userId,
      projectName: body.projectName,
      answers: {},
    },
  });

  return NextResponse.json(product, { status: 201 });
}
