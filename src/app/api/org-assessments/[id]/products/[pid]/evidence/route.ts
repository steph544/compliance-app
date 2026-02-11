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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;
  const product = await getProduct(id, pid, userId);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await prisma.evidenceItem.findMany({
    where: { productAssessmentId: pid },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items);
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
    controlId?: string;
    taskIdentifier?: string;
    requestedArtifact: string;
    status?: "REQUESTED" | "COLLECTED" | "VERIFIED";
    linkUrl?: string;
    note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.requestedArtifact || typeof body.requestedArtifact !== "string") {
    return NextResponse.json(
      { error: "requestedArtifact is required" },
      { status: 400 }
    );
  }

  const item = await prisma.evidenceItem.create({
    data: {
      productAssessmentId: pid,
      controlId: body.controlId ?? null,
      taskIdentifier: body.taskIdentifier ?? null,
      requestedArtifact: body.requestedArtifact,
      status: body.status ?? "REQUESTED",
      linkUrl: body.linkUrl ?? null,
      note: body.note ?? null,
    },
  });

  return NextResponse.json(item);
}
