import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getBaselineSuggestions } from "@/lib/wizard/baseline-suggestions";
import type { BaselineMetricSuggestion, RAIConstraintSuggestion } from "@/lib/wizard/baseline-suggestions";
import { generateBaselineSuggestionsFromAI } from "@/lib/ai/generate-baseline-suggestions";
import { buildProductContextForAI } from "@/lib/ai/product-context-for-ai";

const MAX_METRICS = 15;
const MAX_CONSTRAINTS = 10;

type Answers = Record<string, Record<string, unknown> | undefined>;

export async function POST(
  request: NextRequest,
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
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let body: { answers?: Answers } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const answers: Answers = body.answers ?? {};
  const { suggestedMetrics: ruleMetrics, suggestedConstraints: ruleConstraints } =
    getBaselineSuggestions(answers);

  const suggestedMetrics: (BaselineMetricSuggestion & { aiGenerated?: boolean })[] = ruleMetrics.map(
    (m) => ({ ...m, aiGenerated: false })
  );
  const suggestedConstraints: (RAIConstraintSuggestion & { aiGenerated?: boolean })[] =
    ruleConstraints.map((c) => ({ ...c, aiGenerated: false }));

  const baseContext = buildProductContextForAI(answers);
  const context = {
    ...baseContext,
    existingMetricNames: ruleMetrics.map((m) => m.name),
    existingConstraintMetrics: ruleConstraints.map((c) => c.metric),
  };

  const aiResult = await generateBaselineSuggestionsFromAI(context);

  for (const m of aiResult.suggestedMetrics) {
    if (suggestedMetrics.length >= MAX_METRICS) break;
    suggestedMetrics.push({
      name: m.name,
      currentValue: m.currentValue ?? "",
      target: m.target,
      mustHave: m.mustHave ?? false,
      reason: m.reason,
      aiGenerated: true,
    });
  }

  for (const c of aiResult.suggestedConstraints) {
    if (suggestedConstraints.length >= MAX_CONSTRAINTS) break;
    suggestedConstraints.push({
      metric: c.metric,
      threshold: c.threshold,
      owner: c.owner ?? context.department,
      reason: c.reason,
      aiGenerated: true,
    });
  }

  return NextResponse.json({ suggestedMetrics, suggestedConstraints });
}
