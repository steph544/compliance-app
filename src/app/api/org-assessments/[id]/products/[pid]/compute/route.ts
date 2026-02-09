import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { computeProductRiskScore } from "@/lib/scoring/product-risk-scorer";
import { validateFitForAI } from "@/lib/scoring/fit-for-ai";
import { generateReleaseCriteria } from "@/lib/scoring/release-criteria";
import { mapCompliance } from "@/lib/scoring/compliance-mapper";
import { recommendHumanAIConfig } from "@/lib/scoring/human-ai-config";
import { generateServiceCard } from "@/lib/scoring/service-card-generator";
import { generateImplementationChecklist } from "@/lib/scoring/implementation-checklist";
import { suggestCloudServicesFromAI } from "@/lib/ai/suggest-cloud-services";
import { buildProductContextForAI } from "@/lib/ai/product-context-for-ai";
import { generateTechnicalControlRecommendations } from "@/lib/ai/generate-technical-control-recommendations";
import { runEngine } from "@/lib/rules-engine";
import { mapToNist } from "@/lib/scoring/nist-mapper";
import type { ProductAnswers, OrgAnswers } from "@/lib/scoring/types";
import type { RuleConfig } from "@/lib/rules-engine/types";
import productRulesData from "@/data/product-rules-seed.json";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, pid } = await params;

  // Verify org assessment and get result
  const orgAssessment = await prisma.orgAssessment.findFirst({
    where: { id, userId },
    include: { result: true },
  });
  if (!orgAssessment) return NextResponse.json({ error: "Org not found" }, { status: 404 });
  if (!orgAssessment.result) return NextResponse.json({ error: "Org assessment not computed" }, { status: 400 });

  const product = await prisma.productAssessment.findFirst({
    where: { id: pid, orgAssessmentId: id },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const productAnswers = product.answers as unknown as ProductAnswers;
  const orgAnswers = orgAssessment.answers as unknown as OrgAnswers;
  const orgResult = orgAssessment.result;

  // Build org context for product scoring
  const orgContext = {
    orgRiskTier: orgResult.riskTier,
    orgJurisdictions: orgAnswers.step2?.countries || [],
    orgRiskTolerance: {
      financial: orgAnswers.step4?.financial || 3,
      operational: orgAnswers.step4?.operational || 3,
      safetyWellbeing: orgAnswers.step4?.safetyWellbeing || 3,
      reputational: orgAnswers.step4?.reputational || 3,
    },
  };

  // 1. Product risk scoring
  const riskResult = computeProductRiskScore(productAnswers, orgContext);

  // 2. Fit-for-AI validation
  const fitForAI = validateFitForAI(productAnswers);

  // 3. Stakeholder map
  const stakeholderMap = {
    upstream: productAnswers.step4?.upstreamStakeholders || [],
    downstream: productAnswers.step4?.downstreamStakeholders || [],
    inclusionConcerns: productAnswers.step4?.inclusionConcerns || [],
  };

  // 4. Release criteria matrix
  const releaseCriteria = generateReleaseCriteria(productAnswers);

  // 5. Rules engine for product controls
  const context = {
    riskTier: riskResult.tier,
    aiType: productAnswers.step3?.aiType || [],
    endUsers: productAnswers.step4?.endUsers,
    canDenyServices: productAnswers.step4?.canDenyServices || false,
    impactSeverity: productAnswers.step4?.impactSeverity,
    dataTypes: productAnswers.step5?.dataTypes || [],
    humanAIConfig: productAnswers.step6?.humanAIConfig,
    promptInjectionExposure: productAnswers.step7?.promptInjectionExposure || false,
    hallucinationRisk: productAnswers.step7?.hallucinationRisk,
    biasRiskCategories: productAnswers.step7?.biasRiskCategories || [],
    projectStage: productAnswers.step1?.projectStage,
  };

  const rules = productRulesData as RuleConfig[];
  const controlSelections = runEngine(context, rules);

  // 6. Enrich controls with vendor guidance
  const controls = await prisma.control.findMany({
    where: { controlId: { in: controlSelections.map((s) => s.controlId) } },
    include: { nistRefs: true },
  });

  const providers = orgAnswers.step7?.providers || [];
  const technicalControls = controlSelections.map((sel) => {
    const control = controls.find((c: any) => c.controlId === sel.controlId);
    const vendorGuidance = control?.vendorGuidance as Record<string, unknown> | null;
    const relevantGuidance: Record<string, unknown> = {};

    if (vendorGuidance) {
      if (providers.includes("bedrock") || providers.includes("aws")) relevantGuidance.aws = vendorGuidance.aws;
      if (providers.includes("azure")) relevantGuidance.azure = vendorGuidance.azure;
      if (providers.includes("openai")) relevantGuidance.openai = vendorGuidance.openai;
      relevantGuidance.generic = vendorGuidance.generic;
    }

    return {
      controlId: sel.controlId,
      controlName: control?.name || sel.controlId,
      description: control?.description,
      designation: sel.designation,
      reasoning: sel.reasoning,
      implementationSteps: control?.implementationSteps || [],
      vendorGuidance: Object.keys(relevantGuidance).length > 0 ? relevantGuidance : undefined,
      aiGenerated: false,
    };
  });

  const baseContext = buildProductContextForAI(productAnswers as Record<string, Record<string, unknown> | undefined>);
  const aiContext = {
    ...baseContext,
    riskTier: riskResult.tier,
    existingControlNames: technicalControls.map((c) => c.controlName ?? c.controlId),
  };
  const aiSuggestions = await generateTechnicalControlRecommendations(aiContext, { count: 6 });
  const maxAiControls = 6;
  for (let i = 0; i < Math.min(aiSuggestions.length, maxAiControls); i++) {
    const item = aiSuggestions[i];
    technicalControls.push({
      controlId: `AI-SUGGEST-${i + 1}`,
      controlName: item.name,
      description: item.description,
      designation: item.designation,
      reasoning: [item.reason],
      implementationSteps: item.implementationSteps ?? [],
      aiGenerated: true,
      accepted: false,
    });
  }

  // 7. Compliance requirements
  const compliance = mapCompliance(productAnswers, orgAnswers.step2?.countries || []);

  // 8. NIST mapping
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

  // 9. Implementation checklist (one task per control with steps and evidence)
  const controlSummaries = controlSelections.map((sel) => {
    const control = controls.find((c: { controlId: string }) => c.controlId === sel.controlId);
    return {
      controlId: sel.controlId,
      controlName: control?.name ?? sel.controlId,
      implementationSteps: (control?.implementationSteps as string[]) ?? [],
      evidenceArtifacts: (control?.evidenceArtifacts as string[]) ?? [],
    };
  });
  const checklist = generateImplementationChecklist(productAnswers, controlSummaries, releaseCriteria);

  // Derive cloud provider for checklist suggested services (AWS or Azure only)
  const primaryCloud = orgAnswers.step7?.primaryCloudInfrastructure;
  const hasAws = providers.includes("aws") || providers.includes("bedrock");
  const hasAzure = providers.includes("azure");
  let cloudProvider: "aws" | "azure" | null = null;
  if (primaryCloud === "aws" || (hasAws && primaryCloud !== "azure")) cloudProvider = "aws";
  else if (primaryCloud === "azure" || (hasAzure && primaryCloud !== "aws")) cloudProvider = "azure";

  if (cloudProvider) {
    for (const phase of checklist) {
      for (const task of phase.tasks) {
        const t = task as { controlId?: string; suggestedServices?: { provider: "aws" | "azure"; service: string; description?: string }[] };
        if (!t.controlId) continue;
        const control = controls.find((c: { controlId: string }) => c.controlId === t.controlId);
        const vendorGuidance = control?.vendorGuidance as Record<string, { service?: string; description?: string; steps?: string[] }> | null;
        if (!vendorGuidance?.[cloudProvider]) continue;
        const guidance = vendorGuidance[cloudProvider];
        if (guidance?.service) {
          t.suggestedServices = [
            { provider: cloudProvider, service: guidance.service, description: guidance.description },
          ];
        }
      }
    }

    const aiEnabled =
      process.env.OPENAI_API_KEY?.trim() &&
      process.env.AI_SUGGESTED_SERVICES_ENABLED !== "false";
    const controlDerivedTasks = checklist.flatMap((phase) =>
      phase.tasks.filter(
        (task): task is typeof task & { controlId: string } =>
          typeof task === "object" && task !== null && "controlId" in task && typeof (task as { controlId?: string }).controlId === "string"
      )
    );
    if (aiEnabled && controlDerivedTasks.length > 0) {
      const controlContexts = controlDerivedTasks.map((t) => {
        const control = controls.find((c: { controlId: string }) => c.controlId === (t as { controlId: string }).controlId);
        const c = t as { controlId: string; task?: string };
        return {
          controlId: c.controlId,
          controlName: (c as { task?: string }).task ?? c.controlId,
          description: control?.description as string | undefined,
          implementationSteps: control?.implementationSteps as string[] | undefined,
        };
      });
      try {
        const aiResults = await suggestCloudServicesFromAI({
          controlContexts,
          cloudProvider,
        });
        for (const { controlId, suggestions } of aiResults) {
          if (suggestions.length === 0) continue;
          for (const phase of checklist) {
            for (const task of phase.tasks) {
              const t = task as { controlId?: string; suggestedServices?: { provider: "aws" | "azure"; service: string; description?: string }[] };
              if (t.controlId !== controlId) continue;
              const existing = t.suggestedServices ?? [];
              const existingNames = new Set(existing.map((s) => s.service.toLowerCase().trim()));
              for (const s of suggestions) {
                if (!s.service?.trim() || existingNames.has(s.service.toLowerCase().trim())) continue;
                existingNames.add(s.service.toLowerCase().trim());
                existing.push({
                  provider: cloudProvider,
                  service: s.service.trim(),
                  description: typeof s.description === "string" ? s.description.trim() : undefined,
                });
              }
              t.suggestedServices = existing;
              break;
            }
          }
        }
      } catch (err) {
        console.error("[product compute] AI suggested services failed:", err);
      }
    }
  }

  // 10. Service card
  const serviceCard = generateServiceCard(productAnswers);

  // 11. Human-AI config
  const humanAIConfig = recommendHumanAIConfig(productAnswers);

  // 12. Monitoring spec — align with org plan when available, else product-only fallback
  const orgPlan = (orgResult as Record<string, unknown>)?.monitoringPlan as {
    metrics?: Array<{ name?: string; target?: string }>;
  } | undefined;
  const orgMetrics = Array.isArray(orgPlan?.metrics) ? orgPlan.metrics : [];

  type ProductMetric = { name: string; threshold: string; alertCondition: string };
  const ALERT_CONDITIONS: Record<string, string> = {
    "Model accuracy": "Drops below threshold",
    "Bias metrics": "Disparity ratio > 0.8 or < 1.25",
    "Response latency (p95)": "Exceeds threshold for 5 minutes",
    "Error rate": "Exceeds 1% for 15 minutes",
    "System availability": "Drops below 99.5% for 15 minutes",
    "Data drift": "Breaches threshold",
    "Data privacy / access": "Breaches threshold",
    "Biometric accuracy / consent": "Breaches threshold",
  };
  function normalizeMetricName(orgName: string): string {
    const n = (orgName || "").trim();
    if (n === "Model accuracy/performance") return "Model accuracy";
    if (n === "Inference latency") return "Response latency (p95)";
    return n;
  }

  let metrics: ProductMetric[];
  if (orgMetrics.length > 0) {
    const byName = new Map<string, ProductMetric>();
    for (const m of orgMetrics) {
      const name = normalizeMetricName((m as { name?: string }).name ?? "");
      if (!name) continue;
      const target = (m as { target?: string }).target ?? "";
      byName.set(name, {
        name,
        threshold: target,
        alertCondition: ALERT_CONDITIONS[name] ?? "Breaches threshold",
      });
    }
    // Product override: latency threshold from product answers
    const latencyThreshold = productAnswers.step6?.latencyRequirements;
    if (latencyThreshold && byName.has("Response latency (p95)")) {
      const existing = byName.get("Response latency (p95)")!;
      byName.set("Response latency (p95)", { ...existing, threshold: latencyThreshold });
    } else if (latencyThreshold) {
      byName.set("Response latency (p95)", {
        name: "Response latency (p95)",
        threshold: latencyThreshold,
        alertCondition: "Exceeds threshold for 5 minutes",
      });
    }
    // Bias: ensure present if product has bias risk categories
    if (productAnswers.step7?.biasRiskCategories?.length && !byName.has("Bias metrics")) {
      byName.set("Bias metrics", {
        name: "Bias metrics",
        threshold: "No statistically significant disparate impact",
        alertCondition: "Disparity ratio > 0.8 or < 1.25",
      });
    }
    metrics = [...byName.values()];
  } else {
    metrics = [
      { name: "Model accuracy", threshold: "Within 5% of baseline", alertCondition: "Drops below threshold" },
      { name: "Response latency (p95)", threshold: productAnswers.step6?.latencyRequirements || "< 2s", alertCondition: "Exceeds threshold for 5 minutes" },
      { name: "Error rate", threshold: "< 1%", alertCondition: "Exceeds 1% for 15 minutes" },
      ...(productAnswers.step7?.biasRiskCategories?.length ? [{ name: "Bias metrics", threshold: "No statistically significant disparate impact", alertCondition: "Disparity ratio > 0.8 or < 1.25" }] as ProductMetric[] : []),
    ];
  }

  const monitoringSpec = {
    metrics,
    dashboardSpec: `${productAnswers.step1?.projectName || "AI System"} Monitoring Dashboard`,
    environmentalTracking: {
      modelSize: productAnswers.step6?.modelSize || "unknown",
      inferenceVolume: productAnswers.step6?.inferenceVolume || "unknown",
      estimatedFootprint: productAnswers.step6?.modelSize === "large" ? "High — consider optimization" : "Moderate",
    },
    humanAIConfig,
  };

  // 13. Persist result
  const resultData = {
    riskTier: riskResult.tier,
    riskScore: riskResult.score,
    riskDrivers: riskResult.drivers as any,
    fitForAiResult: fitForAI as any,
    stakeholderMap: stakeholderMap as any,
    releaseCriteriaMatrix: releaseCriteria as any,
    technicalControls: technicalControls as any,
    complianceRequirements: compliance as any,
    nistMapping: nistMapping as any,
    implementationChecklist: checklist as any,
    serviceCard: serviceCard as any,
    monitoringSpec: monitoringSpec as any,
  };

  const result = await prisma.productAssessmentResult.upsert({
    where: { assessmentId: pid },
    create: { assessmentId: pid, ...resultData },
    update: { ...resultData, computedAt: new Date() },
  });

  await prisma.productAssessment.update({
    where: { id: pid },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json(result);
}
