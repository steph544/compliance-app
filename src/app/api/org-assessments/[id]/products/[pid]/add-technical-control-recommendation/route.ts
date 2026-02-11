import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { buildProductContextForAI } from "@/lib/ai/product-context-for-ai";
import { generateTechnicalControlRecommendations } from "@/lib/ai/generate-technical-control-recommendations";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;

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
    riskTier?: string;
    technicalControls?: Array<{ controlId?: string; controlName?: string; [key: string]: unknown }>;
  };
  const existingControls = Array.isArray(result.technicalControls) ? result.technicalControls : [];

  const baseContext = buildProductContextForAI(
    product.answers as Record<string, Record<string, unknown> | undefined>
  );
  const aiContext = {
    ...baseContext,
    riskTier: result.riskTier ?? "LOW",
    existingControlNames: existingControls.map((c) => c.controlName ?? c.controlId ?? "").filter(Boolean),
  };

  const suggestions = await generateTechnicalControlRecommendations(aiContext, { count: 1 });
  const item = suggestions[0];
  if (!item) {
    return NextResponse.json(
      { error: "Could not generate a recommendation; try again or check OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  const aiSuggestIndex = existingControls.filter((c) =>
    String(c.controlId ?? "").startsWith("AI-SUGGEST-")
  ).length;
  const newControl = {
    controlId: `AI-SUGGEST-${aiSuggestIndex + 1}`,
    controlName: item.name,
    description: item.description,
    designation: item.designation,
    reasoning: [item.reason],
    implementationSteps: item.implementationSteps ?? [],
    aiGenerated: true,
    accepted: false,
  };

  const updatedControls = [...existingControls, newControl];
  await prisma.productAssessmentResult.update({
    where: { assessmentId: pid },
    data: { technicalControls: updatedControls as object },
  });

  await logAudit({
    entityType: "ProductAssessment",
    entityId: pid,
    action: "add_recommendation",
    actorId: userId,
    payload: { controlId: newControl.controlId },
  }).catch((e) => console.error("[audit] add_recommendation:", e));

  revalidatePath(`/org/${id}/product/${pid}/results`);

  return NextResponse.json({ control: newControl, technicalControls: updatedControls });
}
