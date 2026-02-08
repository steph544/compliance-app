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
  const assessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
    include: {
      result: true,
      _count: { select: { aiSystems: true, products: true } },
    },
  });

  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(assessment);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.orgAssessment.findFirst({
    where: { id, userId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currentAnswers = (existing.answers as Record<string, unknown>) || {};
  const updatedAnswers = { ...currentAnswers, ...body.answers };
  const step1 = updatedAnswers.step1 as { orgName?: string } | undefined;
  const orgName =
    body.orgName ?? (step1?.orgName && step1.orgName.trim() !== "" ? step1.orgName : undefined) ?? existing.orgName;

  const assessment = await prisma.orgAssessment.update({
    where: { id },
    data: {
      answers: updatedAnswers,
      orgName,
    },
  });

  return NextResponse.json(assessment);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.orgAssessment.findFirst({
    where: { id, userId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.orgAssessment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
