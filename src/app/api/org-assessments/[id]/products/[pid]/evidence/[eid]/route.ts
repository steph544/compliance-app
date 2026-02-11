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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string; eid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid, eid } = await params;
  const product = await getProduct(id, pid, userId);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.evidenceItem.findFirst({
    where: { id: eid, productAssessmentId: pid },
  });
  if (!existing) return NextResponse.json({ error: "Evidence item not found" }, { status: 404 });

  let body: { status?: "REQUESTED" | "COLLECTED" | "VERIFIED"; note?: string; linkUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: { status?: string; note?: string; linkUrl?: string } = {};
  if (body.status) data.status = body.status;
  if (body.note !== undefined) data.note = body.note;
  if (body.linkUrl !== undefined) data.linkUrl = body.linkUrl;

  const item = await prisma.evidenceItem.update({
    where: { id: eid },
    data,
  });

  if (body.status && body.status !== existing.status) {
    await logAudit({
      entityType: "ProductAssessment",
      entityId: pid,
      action: "evidence_submitted",
      actorId: userId,
      payload: { evidenceItemId: eid, previousStatus: existing.status, newStatus: body.status },
    }).catch((e) => console.error("[audit] evidence_submitted:", e));
  }

  return NextResponse.json(item);
}
