import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

async function getProduct(orgId: string, pid: string, userId: string) {
  const org = await prisma.orgAssessment.findFirst({
    where: { id: orgId, userId },
  });
  if (!org) return null;
  return prisma.productAssessment.findFirst({
    where: { id: pid, orgAssessmentId: orgId },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string; tid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid, tid } = await params;
  const product = await getProduct(id, pid, userId);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.reassessmentTrigger.findFirst({
    where: { id: tid, productAssessmentId: pid },
  });
  if (!existing) return NextResponse.json({ error: "Trigger not found" }, { status: 404 });

  await prisma.reassessmentTrigger.delete({ where: { id: tid } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string; tid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid, tid } = await params;
  const product = await getProduct(id, pid, userId);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.reassessmentTrigger.findFirst({
    where: { id: tid, productAssessmentId: pid },
  });
  if (!existing) return NextResponse.json({ error: "Trigger not found" }, { status: 404 });

  let body: { lastCheckedAt?: string; nextDueAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: { lastCheckedAt?: Date; nextDueAt?: Date } = {};
  if (body.lastCheckedAt) data.lastCheckedAt = new Date(body.lastCheckedAt);
  if (body.nextDueAt) data.nextDueAt = new Date(body.nextDueAt);

  const trigger = await prisma.reassessmentTrigger.update({
    where: { id: tid },
    data,
  });

  return NextResponse.json(trigger);
}
