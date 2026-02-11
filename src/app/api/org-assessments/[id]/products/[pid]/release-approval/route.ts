import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

async function getProduct(orgId: string, pid: string, userId: string) {
  const org = await prisma.orgAssessment.findFirst({
    where: { id: orgId, userId },
  });
  if (!org) return null;
  return prisma.productAssessment.findFirst({
    where: { id: pid, orgAssessmentId: orgId },
    include: { releaseApproval: true },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;
  const product = await getProduct(id, pid, userId);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const approval = product.releaseApproval;
  return NextResponse.json(
    approval
      ? {
          status: approval.status,
          approvedBy: approval.approvedBy,
          approvedAt: approval.approvedAt,
          comment: approval.comment,
          createdAt: approval.createdAt,
        }
      : { status: "PENDING", approvedBy: null, approvedAt: null, comment: null, createdAt: null }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;
  const product = await getProduct(id, pid, userId);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { status: "APPROVED" | "REJECTED"; comment?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.status !== "APPROVED" && body.status !== "REJECTED") {
    return NextResponse.json(
      { error: "status must be APPROVED or REJECTED" },
      { status: 400 }
    );
  }

  const now = new Date();
  const approval = await prisma.releaseApproval.upsert({
    where: { productAssessmentId: pid },
    create: {
      productAssessmentId: pid,
      status: body.status,
      approvedBy: userId,
      approvedAt: now,
      comment: body.comment ?? null,
    },
    update: {
      status: body.status,
      approvedBy: userId,
      approvedAt: now,
      comment: body.comment ?? null,
    },
  });

  await logAudit({
    entityType: "ProductAssessment",
    entityId: pid,
    action: "release_approval",
    actorId: userId,
    payload: { status: body.status, comment: body.comment },
  }).catch((e) => console.error("[audit] release_approval:", e));

  revalidatePath(`/org/${id}/product/${pid}/results`);

  return NextResponse.json({
    status: approval.status,
    approvedBy: approval.approvedBy,
    approvedAt: approval.approvedAt,
    comment: approval.comment,
  });
}
