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
    include: { result: { select: { policyDrafts: true } } },
  });

  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!assessment.result) return NextResponse.json({ error: "Assessment not yet computed" }, { status: 404 });

  return NextResponse.json(assessment.result.policyDrafts);
}
