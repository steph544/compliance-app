import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { syncChecklistWithTechnicalControls } from "@/lib/scoring/sync-checklist-with-controls";
import type { ImplementationPhase } from "@/lib/scoring/types";

type ControlRow = {
  controlId?: string;
  [key: string]: unknown;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;
  let body: { controlId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const controlId = body.controlId;
  if (!controlId || typeof controlId !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid controlId" },
      { status: 400 }
    );
  }

  const orgAssessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
  });
  if (!orgAssessment) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const product = await prisma.productAssessment.findFirst({
    where: { id: pid, orgAssessmentId: id },
    include: { result: true },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (!product.result) {
    return NextResponse.json(
      { error: "Product result not found; run compute first." },
      { status: 404 }
    );
  }

  const result = product.result as {
    technicalControls?: ControlRow[];
    implementationChecklist?: ImplementationPhase[];
  };
  const existingControls = Array.isArray(result.technicalControls) ? result.technicalControls : [];
  const index = existingControls.findIndex(
    (c) => String(c.controlId ?? "") === String(controlId)
  );
  if (index === -1) {
    return NextResponse.json(
      { error: "Control not found" },
      { status: 404 }
    );
  }

  const updatedControls = existingControls.map((c, i) => {
    if (i !== index) return { ...c };
    return { ...c, accepted: true };
  }) as ControlRow[];

  const currentChecklist = Array.isArray(result.implementationChecklist)
    ? result.implementationChecklist
    : [];
  const syncedChecklist = syncChecklistWithTechnicalControls(
    updatedControls as { controlId?: string; controlName?: string; implementationSteps?: string[]; aiGenerated?: boolean; accepted?: boolean }[],
    currentChecklist
  );

  try {
    await prisma.productAssessmentResult.update({
      where: { assessmentId: pid },
      data: {
        technicalControls: updatedControls as object,
        implementationChecklist: syncedChecklist as object,
      },
    });
  } catch (err) {
    console.error("[accept-technical-control-recommendation] DB update failed:", err);
    return NextResponse.json(
      { error: "Failed to save; please try again." },
      { status: 500 }
    );
  }

  await logAudit({
    entityType: "ProductAssessment",
    entityId: pid,
    action: "accept_ai_control",
    actorId: userId,
    payload: { controlId },
  }).catch((e) => console.error("[audit] accept_ai_control:", e));

  revalidatePath(`/org/${id}/product/${pid}/results`);

  return NextResponse.json({ technicalControls: updatedControls });
}
