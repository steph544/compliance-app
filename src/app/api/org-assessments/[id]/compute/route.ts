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
import { generateMonitoringRecommendations } from "@/lib/ai/generate-monitoring-recommendations";
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

  // Resolve implementation steps by deployment infrastructure (AWS/Azure vs generic)
  const primaryInfra = answers.step7?.primaryCloudInfrastructure;
  const preferredVendor =
    primaryInfra === "aws" || primaryInfra === "azure" ? primaryInfra : "generic";

  const controlsForMapping = controls.map((c: any) => {
    const vendorGuidance = c.vendorGuidance as Record<
      string,
      { service: string; description: string; steps: string[] }
    > | null;
    let description = c.description;
    let implementationSteps = c.implementationSteps as string[];
    let implementationVendor: "aws" | "azure" | undefined;
    let implementationService: string | undefined;

    if (preferredVendor !== "generic" && vendorGuidance?.[preferredVendor]) {
      const guidance = vendorGuidance[preferredVendor];
      description = guidance.description ?? description;
      implementationSteps = guidance.steps?.length ? guidance.steps : implementationSteps;
      implementationVendor = preferredVendor;
      implementationService = guidance.service;
    }

    return {
      controlId: c.controlId,
      name: c.name,
      description,
      implementationSteps,
      implementationLevel: c.implementationLevel,
      type: c.type,
      nistRefIds: c.nistRefs.map((r: any) => r.id),
      evidenceArtifacts: c.evidenceArtifacts,
      implementationVendor,
      implementationService,
    };
  });

  const nistMapping = mapToNist(controlSelections, controlsForMapping);

  // 6. Monitoring plan (canonical shape: metrics with name, description, target, frequency)
  const cadenceByTier: Record<string, string> = {
    LOW: "Quarterly review",
    MEDIUM: "Monthly review with quarterly deep dive",
    HIGH: "Weekly monitoring with monthly governance review",
    REGULATED: "Continuous monitoring with weekly governance review and monthly board reporting",
  };

  const frequencyByTier: Record<string, string> = {
    LOW: "Quarterly",
    MEDIUM: "Monthly",
    HIGH: "Weekly",
    REGULATED: "Continuous",
  };

  const tierFrequency = frequencyByTier[riskResult.tier];
  const requiredCount = controlSelections.filter((s) => s.designation === "REQUIRED").length;

  const baseMetrics = [
    {
      name: "Model accuracy/performance",
      description: "Track model performance against baseline; alert if degradation persists.",
      target: "Within 5% of baseline",
      frequency: tierFrequency,
    },
    {
      name: "Bias metrics",
      description: "Monitor for statistically significant disparate impact across protected groups.",
      target: "No statistically significant disparate impact",
      frequency: tierFrequency,
    },
    {
      name: "Data drift",
      description: "Feature distribution stability; detect input distribution shifts.",
      target: "Feature distributions within 2 std dev",
      frequency: tierFrequency,
    },
    {
      name: "System availability",
      description: "Uptime and reliability of the AI system and dependencies.",
      target: "99.5% uptime",
      frequency: tierFrequency,
    },
  ];

  // Answer-driven metrics from data posture and AI usage
  const step5 = answers.step5;
  const step6 = answers.step6;
  if (step5?.pii || step5?.phi) {
    baseMetrics.push({
      name: "Data privacy / access",
      description: "Monitor access to PII/PHI and anomaly detection for unauthorized access.",
      target: "No unauthorized access; anomalies investigated within SLA",
      frequency: tierFrequency,
    });
  }
  if (step5?.biometric) {
    baseMetrics.push({
      name: "Biometric accuracy / consent",
      description: "Accuracy of biometric systems and consent/retention compliance.",
      target: "Accuracy within spec; consent records complete",
      frequency: tierFrequency,
    });
  }
  const aiUsage = step6?.aiUsage ?? [];
  if (aiUsage.includes("customer_facing") && !baseMetrics.some((m) => m.name.toLowerCase().includes("latency"))) {
    baseMetrics.push({
      name: "Inference latency",
      description: "End-to-end latency for customer-facing AI; stay within SLA.",
      target: "p95 within 2x baseline",
      frequency: tierFrequency,
    });
  }

  const recommendationBullets: string[] = [];
  recommendationBullets.push(
    `Your risk tier is ${riskResult.tier}, so we recommend ${cadenceByTier[riskResult.tier]}. You can adjust cadence and metrics below.`
  );
  if (requiredCount > 10) {
    recommendationBullets.push(
      `With ${requiredCount} required controls, we suggest configuring PagerDuty or OpsGenie for critical AI alerts.`
    );
  }
  if (step5?.pii || step5?.phi) {
    recommendationBullets.push(
      "You indicated PII or PHI in your data posture; we added a Data privacy / access metric. Consider access logs and anomaly detection."
    );
  }
  if (step5?.biometric) {
    recommendationBullets.push(
      "You indicated biometric data; we added a Biometric accuracy / consent metric. Ensure consent and retention are monitored."
    );
  }
  if (aiUsage.some((u) => u.includes("automated") || u.includes("decision"))) {
    recommendationBullets.push(
      "You use automated or high-stakes decisions; bias and fairness metrics are included. Review thresholds for your use case."
    );
  }

  const aiBullets = await generateMonitoringRecommendations({
    riskTier: riskResult.tier,
    cadence: cadenceByTier[riskResult.tier],
    requiredControlsCount: requiredCount,
    metricNames: baseMetrics.map((m) => m.name),
    dataPosture: step5
      ? {
          pii: step5.pii,
          phi: step5.phi,
          biometric: step5.biometric,
          childrenData: step5.childrenData,
        }
      : undefined,
    aiUsage: step6?.aiUsage,
    jurisdictions: answers.step2?.countries,
    maturityStage: answers.step3?.maturityStage,
    existingGovernance: answers.step8
      ? {
          securityProgram: answers.step8.securityProgram,
          privacyProgram: answers.step8.privacyProgram,
          modelInventory: answers.step8.modelInventory,
          incidentResponse: answers.step8.incidentResponse,
          sdlcControls: answers.step8.sdlcControls,
        }
      : undefined,
  });
  if (aiBullets.length > 0) {
    for (const text of aiBullets) {
      recommendationBullets.push({ text, aiGenerated: true });
    }
    if (recommendationBullets.length > 12) {
      recommendationBullets.splice(12);
    }
  }

  const monitoringPlan = {
    cadence: cadenceByTier[riskResult.tier],
    metrics: baseMetrics,
    alertsSummary:
      requiredCount > 10
        ? "Configure PagerDuty/OpsGenie for critical AI alerts"
        : "Email notifications for governance team",
    recommendationBullets,
  };

  // 7. Operations runbook (canonical shape from generator)
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
