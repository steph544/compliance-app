import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const monitoringMetricSchema = z.object({
  name: z.string(),
  description: z.string(),
  target: z.string(),
  frequency: z.string(),
});

const recommendationBulletSchema = z.union([
  z.string(),
  z.object({ text: z.string(), aiGenerated: z.boolean().optional() }),
]);
const monitoringPlanSchema = z.object({
  metrics: z.array(monitoringMetricSchema),
  cadence: z.string(),
  alertsSummary: z.string().optional(),
  recommendationBullets: z.array(recommendationBulletSchema).optional(),
});

const runbookAlertSchema = z.object({
  name: z.string(),
  condition: z.string(),
  severity: z.string(),
  action: z.string(),
});

const runbookIncidentTriageSchema = z.object({
  severity: z.string(),
  criteria: z.string(),
  responseTime: z.string(),
  owner: z.string(),
});

const runbookEscalationTriggerSchema = z.object({
  trigger: z.string(),
  escalateTo: z.string(),
  timeline: z.string(),
});

const runbookRoleSchema = z.object({
  role: z.string(),
  responsibilities: z.string(),
});

const operationsRunbookSchema = z.object({
  alerts: z.array(runbookAlertSchema),
  incidentTriage: z.array(runbookIncidentTriageSchema),
  escalationTriggers: z.array(runbookEscalationTriggerSchema),
  roles: z.array(runbookRoleSchema),
  timelines: z.array(z.string()),
});

const patchBodySchema = z.object({
  monitoringPlan: monitoringPlanSchema.optional(),
  operationsRunbook: operationsRunbookSchema.optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
    include: { result: true },
  });

  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!assessment.result) {
    return NextResponse.json(
      { error: "Assessment result not found. Run compute first." },
      { status: 404 }
    );
  }

  let body: z.infer<typeof patchBodySchema>;
  try {
    const raw = await request.json();
    body = patchBodySchema.parse(raw);
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body", details: e }, { status: 400 });
  }

  const current = assessment.result as Record<string, unknown>;
  const updated = { ...current };

  if (body.monitoringPlan) {
    const existing = (current.monitoringPlan ?? {}) as Record<string, unknown>;
    updated.monitoringPlan = {
      ...existing,
      ...body.monitoringPlan,
      recommendationBullets: existing.recommendationBullets ?? body.monitoringPlan.recommendationBullets,
    };
  }
  if (body.operationsRunbook) {
    updated.operationsRunbook = body.operationsRunbook;
  }

  const result = await prisma.orgAssessmentResult.update({
    where: { assessmentId: id },
    data: {
      monitoringPlan: updated.monitoringPlan as object,
      operationsRunbook: updated.operationsRunbook as object,
    },
  });

  return NextResponse.json({
    monitoringPlan: result.monitoringPlan,
    operationsRunbook: result.operationsRunbook,
  });
}
