import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { ImplementationPhase } from "@/lib/scoring/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;

  const orgAssessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
  });
  if (!orgAssessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const product = await prisma.productAssessment.findFirst({
    where: { id: pid, orgAssessmentId: id },
    include: { result: true },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (!product.result)
    return NextResponse.json(
      { error: "Product result not found; run compute first." },
      { status: 404 }
    );

  let body: { implementationChecklist?: ImplementationPhase[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.implementationChecklist)) {
    return NextResponse.json(
      { error: "Body must include implementationChecklist array" },
      { status: 400 }
    );
  }

  await prisma.productAssessmentResult.update({
    where: { assessmentId: pid },
    data: { implementationChecklist: body.implementationChecklist as object },
  });

  return NextResponse.json({ ok: true });
}
