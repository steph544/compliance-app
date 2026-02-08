import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

interface NistProgress {
  implementedControlIds: string[];
  controlNotes: Record<string, string>;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const result = await prisma.orgAssessmentResult.findFirst({
    where: {
      assessmentId: id,
      assessment: { userId },
    },
    select: { nistProgress: true },
  });

  if (!result)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const progress = (result.nistProgress ?? {}) as unknown as NistProgress;

  return NextResponse.json({
    implementedControlIds: progress.implementedControlIds ?? [],
    controlNotes: progress.controlNotes ?? {},
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const result = await prisma.orgAssessmentResult.findFirst({
    where: {
      assessmentId: id,
      assessment: { userId },
    },
    select: { id: true, nistProgress: true },
  });

  if (!result)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = (result.nistProgress ?? {}) as unknown as NistProgress;

  const updated: NistProgress = {
    implementedControlIds:
      body.implementedControlIds ?? existing.implementedControlIds ?? [],
    controlNotes: {
      ...(existing.controlNotes ?? {}),
      ...(body.controlNotes ?? {}),
    },
  };

  await prisma.orgAssessmentResult.update({
    where: { id: result.id },
    data: { nistProgress: updated as any },
  });

  return NextResponse.json(updated);
}
