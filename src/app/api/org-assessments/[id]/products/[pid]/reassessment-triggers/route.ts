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

function computeNextDue(config: { intervalDays?: number }, from = new Date()): Date {
  const days = Number((config as { intervalDays?: number }).intervalDays) || 90;
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
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

  const triggers = await prisma.reassessmentTrigger.findMany({
    where: { productAssessmentId: pid },
    orderBy: { nextDueAt: "asc" },
  });

  return NextResponse.json(triggers);
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

  let body: {
    triggerType: "SCHEDULE" | "THRESHOLD" | "EVENT" | "MANUAL";
    config?: { intervalDays?: number; cron?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const triggerType = body.triggerType ?? "SCHEDULE";
  const config = body.config ?? { intervalDays: 90 };
  const nextDueAt = computeNextDue(config as { intervalDays?: number });

  const trigger = await prisma.reassessmentTrigger.create({
    data: {
      productAssessmentId: pid,
      triggerType,
      config: config as object,
      nextDueAt,
    },
  });

  return NextResponse.json(trigger);
}
