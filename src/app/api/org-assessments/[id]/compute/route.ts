import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { computeOrgRiskScore } from "@/lib/scoring/org-risk-scorer";
import { computeReadinessHeatmap } from "@/lib/scoring/readiness-heatmap";
import { generateGovernanceBlueprint } from "@/lib/scoring/governance-generator";
import { runEngine } from "@/lib/rules-engine";
import { mapToNist } from "@/lib/scoring/nist-mapper";
import { generateResponsibleAIPolicy } from "@/lib/policy-generator/responsible-ai-policy";
import { generateTransparencyPolicy } from "@/lib/policy-generator/transparency-policy";
import { generateOperationsRunbook } from "@/lib/scoring/operations-runbook";
import type { OrgAnswers } from "@/lib/scoring/types";
import type { RuleConfig } from "@/lib/rules-engine/types";
import orgRulesData from "@/data/org-rules-seed.json";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
  });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const answers = assessment.answers as unknown as OrgAnswers;

  // 1. Risk scoring
  const riskResult = computeOrgRiskScore(answers);

  // 2. Readiness heatmap
  const heatmap = computeReadinessHeatmap(answers);

  // 3. Governance blueprint
  const blueprint = generateGovernanceBlueprint(answers);

  // 4. Rules engine — build context from answers
  const context = {
    riskTier: riskResult.tier,
    aiMaturity: answers.step3?.maturityStage,
    dataPosture: answers.step5 || {},
    aiUsage: answers.step6?.aiUsage || [],
    vendorPosture: answers.step7 || {},
    jurisdictions: answers.step2?.countries || [],
    existingGovernance: answers.step8 || {},
  };

  const rules = orgRulesData as RuleConfig[];
  const controlSelections = runEngine(context, rules);

  // 5. Load controls for NIST mapping
  const controls = await prisma.control.findMany({
    where: {
      controlId: { in: controlSelections.map((s) => s.controlId) },
    },
    include: { nistRefs: true },
  });

  const controlsForMapping = controls.map((c: any) => ({
    controlId: c.controlId,
    name: c.name,
    description: c.description,
    implementationSteps: c.implementationSteps,
    implementationLevel: c.implementationLevel,
    type: c.type,
    nistRefIds: c.nistRefs.map((r: any) => r.id),
    evidenceArtifacts: c.evidenceArtifacts,
  }));

  const nistMapping = mapToNist(controlSelections, controlsForMapping);

  // 6. Monitoring plan
  const cadenceByTier: Record<string, string> = {
    LOW: "Quarterly review",
    MEDIUM: "Monthly review with quarterly deep dive",
    HIGH: "Weekly monitoring with monthly governance review",
    REGULATED: "Continuous monitoring with weekly governance review and monthly board reporting",
  };

  const monitoringPlan = {
    cadence: cadenceByTier[riskResult.tier],
    metrics: [
      { name: "Model accuracy/performance", threshold: "Within 5% of baseline", alertCondition: "Drops below threshold for 48h" },
      { name: "Bias metrics", threshold: "No statistically significant disparate impact", alertCondition: "Any protected group deviation > 10%" },
      { name: "Data drift", threshold: "Feature distributions within 2 std dev", alertCondition: "Any feature outside threshold" },
      { name: "System availability", threshold: "99.5% uptime", alertCondition: "Downtime > 30 minutes" },
    ],
    alerts: controlSelections.filter((s) => s.designation === "REQUIRED").length > 10
      ? "Configure PagerDuty/OpsGenie for critical AI alerts"
      : "Email notifications for governance team",
  };

  // 7. Operations runbook
  const runbook = generateOperationsRunbook(answers, monitoringPlan);

  // 8. Policy drafts
  const responsibleAI = generateResponsibleAIPolicy(answers, riskResult);
  const transparency = generateTransparencyPolicy(answers, riskResult);

  // 9. Persist result (upsert to allow recomputation)
  const resultData = {
    riskTier: riskResult.tier,
    riskScore: riskResult.score,
    riskDrivers: riskResult.drivers as any,
    readinessHeatmap: heatmap as any,
    governanceBlueprint: blueprint as any,
    nistMapping: nistMapping as any,
    controlSelections: controlSelections as any,
    monitoringPlan: monitoringPlan as any,
    operationsRunbook: runbook as any,
    policyDrafts: { responsibleAI, transparency } as any,
  };

  const result = await prisma.orgAssessmentResult.upsert({
    where: { assessmentId: id },
    create: { assessmentId: id, ...resultData },
    update: { ...resultData, computedAt: new Date() },
  });

  // Update assessment status
  await prisma.orgAssessment.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json(result);
}
