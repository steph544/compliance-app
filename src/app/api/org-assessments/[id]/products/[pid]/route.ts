import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;
  const assessment = await prisma.orgAssessment.findFirst({ where: { id, userId } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const product = await prisma.productAssessment.findFirst({
    where: { id: pid, orgAssessmentId: id },
    include: { result: true },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json(product);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;
  const assessment = await prisma.orgAssessment.findFirst({ where: { id, userId } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.productAssessment.findFirst({
    where: { id: pid, orgAssessmentId: id },
  });
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await request.json();
  const currentAnswers = (existing.answers as Record<string, unknown>) || {};
  const updatedAnswers = { ...currentAnswers, ...body.answers };
  const step1 = updatedAnswers.step1 as { projectName?: string } | undefined;
  const projectName =
    body.projectName ??
    (step1?.projectName && step1.projectName.trim() !== "" ? step1.projectName : undefined) ??
    existing.projectName;

  const product = await prisma.productAssessment.update({
    where: { id: pid },
    data: {
      answers: updatedAnswers,
      projectName,
    },
  });

  return NextResponse.json(product);
}
