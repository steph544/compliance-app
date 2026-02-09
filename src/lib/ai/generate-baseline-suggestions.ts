import OpenAI from "openai";

export interface BaselineSuggestionsContext {
  projectName: string;
  description: string;
  businessObjective: string;
  projectStage: string;
  department: string;
  projectOwner: string;
  couldSolveWithoutAI: string;
  aiMaterialAdvantage: string;
  machineErrorMoreHarmful: boolean;
  worstCaseImpact: string;
  buildIntegrateBuy: string;
  aiType: string[];
  modelSource: string;
  specificModels: string[];
  trainingDataSource: string[];
  endUsers: string;
  decisions: string;
  canDenyServices: boolean;
  impactSeverity: string;
  affectedPopulation: string;
  upstreamStakeholders: string[];
  downstreamStakeholders: string[];
  inclusionConcerns: string[];
  dataTypes: string[];
  dataSources: string[];
  lawfulBasis: string;
  crossBorderDataFlows: boolean;
  dataResidency: string;
  dataRetention: string;
  consentMechanisms: string;
  anonymization: string;
  inputTypes: string;
  outputTypes: string;
  integrationPoints: string;
  humanAIConfig: string;
  operatorProficiency: string;
  operatorOverrideAuthority: boolean;
  fallback: string;
  latencyRequirements: string;
  logging: string;
  modelSize: string;
  inferenceVolume: string;
  cloudRegion: string;
  promptInjectionExposure: boolean;
  hallucinationRisk: string;
  biasRiskCategories: string[];
  adversarialAttackSurface: string;
  dataPoisoningRisk: boolean;
  ipConfidentialityConcerns: boolean;
  regulatoryRisks: string[];
  existingMetricNames: string[];
  existingConstraintMetrics: string[];
}

export interface AIMetricSuggestion {
  name: string;
  currentValue?: string;
  target: string;
  mustHave?: boolean;
  reason?: string;
}

export interface AIConstraintSuggestion {
  metric: string;
  threshold: string;
  owner?: string;
  reason?: string;
}

const REQUEST_TIMEOUT_MS = 15_000;

function extractJsonFromMessage(content: string): string {
  const trimmed = content.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  return trimmed;
}

const LOG_PREFIX = "[generate-baseline-suggestions]";

/**
 * Generate 2–5 additional baseline metrics and 2–5 RAI constraints from context.
 * Returns empty arrays if OPENAI_API_KEY is missing or on errors.
 */
export async function generateBaselineSuggestionsFromAI(
  context: BaselineSuggestionsContext
): Promise<{
  suggestedMetrics: AIMetricSuggestion[];
  suggestedConstraints: AIConstraintSuggestion[];
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    console.log(`${LOG_PREFIX} Skipping: OPENAI_API_KEY is not set.`);
    return { suggestedMetrics: [], suggestedConstraints: [] };
  }

  const model =
    process.env.OPENAI_BASELINE_SUGGESTIONS_MODEL ||
    process.env.OPENAI_SUGGESTIONS_MODEL ||
    "gpt-4o-mini";

  const systemMessage =
    "You are an expert in AI governance, baseline metrics, and responsible AI constraints. Suggest only concrete, measurable baseline metrics and RAI constraints that apply to the given product context. Do not duplicate any existing metric names or constraint metrics you are given. Each suggestion must have a short reason. Output valid JSON only.";

  const ns = (s: string) => (s?.trim() ? s.trim() : "not specified");
  const arr = (a: string[]) => (Array.isArray(a) && a.length > 0 ? a.join(", ") : "none");

  const userMessage = `Given this full product assessment context, suggest 2–5 additional baseline metrics and 2–5 additional RAI constraints. Do NOT suggest anything that duplicates the existing lists below.

Project overview:
- Project name: ${context.projectName}
- Description: ${ns(context.description)}
- Business objective: ${ns(context.businessObjective)}
- Project stage: ${context.projectStage}
- Department: ${context.department}
- Project owner: ${ns(context.projectOwner)}

Fit-for-AI:
- Could solve without AI: ${context.couldSolveWithoutAI}
- AI material advantage: ${context.aiMaterialAdvantage}
- Machine error more harmful: ${context.machineErrorMoreHarmful}
- Worst case impact: ${context.worstCaseImpact}
- Build/integrate/buy: ${context.buildIntegrateBuy}

AI system details:
- AI type(s): ${arr(context.aiType)}
- Model source: ${context.modelSource}
- Specific models: ${arr(context.specificModels)}
- Training data source: ${arr(context.trainingDataSource)}

Use case & impact:
- End users: ${context.endUsers}
- Decisions: ${ns(context.decisions)}
- Can deny services/benefits: ${context.canDenyServices}
- Impact severity: ${context.impactSeverity}
- Affected population: ${context.affectedPopulation}
- Upstream stakeholders: ${arr(context.upstreamStakeholders)}
- Downstream stakeholders: ${arr(context.downstreamStakeholders)}
- Inclusion concerns: ${arr(context.inclusionConcerns)}

Data & privacy:
- Data types: ${arr(context.dataTypes)}
- Data sources: ${arr(context.dataSources)}
- Lawful basis: ${ns(context.lawfulBasis)}
- Cross-border data flows: ${context.crossBorderDataFlows}
- Data residency: ${ns(context.dataResidency)}
- Data retention: ${ns(context.dataRetention)}
- Consent mechanisms: ${ns(context.consentMechanisms)}
- Anonymization: ${ns(context.anonymization)}

Technical architecture:
- Input types: ${ns(context.inputTypes)}
- Output types: ${ns(context.outputTypes)}
- Integration points: ${ns(context.integrationPoints)}
- Human-in-the-loop: ${context.humanAIConfig}
- Operator proficiency: ${ns(context.operatorProficiency)}
- Operator override authority: ${context.operatorOverrideAuthority}
- Fallback: ${ns(context.fallback)}
- Latency requirements: ${ns(context.latencyRequirements)}
- Logging: ${ns(context.logging)}
- Model size: ${context.modelSize}
- Inference volume: ${context.inferenceVolume}
- Cloud region: ${ns(context.cloudRegion)}

Risk & threat:
- Prompt injection exposure: ${context.promptInjectionExposure}
- Hallucination risk: ${context.hallucinationRisk}
- Bias risk categories: ${arr(context.biasRiskCategories)}
- Adversarial attack surface: ${ns(context.adversarialAttackSurface)}
- Data poisoning risk: ${context.dataPoisoningRisk}
- IP/confidentiality concerns: ${context.ipConfidentialityConcerns}
- Regulatory risks: ${arr(context.regulatoryRisks)}

Existing metric names (do not duplicate): ${arr(context.existingMetricNames)}
Existing constraint metrics (do not duplicate): ${arr(context.existingConstraintMetrics)}

Return a JSON object with two keys:
- "suggestedMetrics": array of objects with "name" (string), "target" (string), "reason" (string). Optional: "currentValue" (string), "mustHave" (boolean).
- "suggestedConstraints": array of objects with "metric" (string), "threshold" (string), "reason" (string). Optional: "owner" (string).

Example: { "suggestedMetrics": [{ "name": "Latency p95", "target": "< 500ms", "reason": "..." }], "suggestedConstraints": [{ "metric": "Explainability", "threshold": "Documented for high-stakes", "reason": "..." }] }`;

  console.log(`${LOG_PREFIX} Sending request to OpenAI (model=${model})...`);
  console.log(`${LOG_PREFIX} Context: project=${context.projectName}, aiType=${context.aiType.length}, existingMetrics=${context.existingMetricNames.length}, existingConstraints=${context.existingConstraintMetrics.length}`);

  try {
    const client = new OpenAI({ apiKey });
    const completion = await Promise.race([
      client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("OpenAI request timeout")), REQUEST_TIMEOUT_MS)
      ),
    ]);

    const raw = completion.choices[0]?.message?.content;
    console.log(`${LOG_PREFIX} Response received. Raw length: ${raw?.length ?? 0}`);
    if (raw) {
      console.log(`${LOG_PREFIX} Raw response:`, raw);
    }

    if (!raw) {
      console.log(`${LOG_PREFIX} No content in completion; choices:`, JSON.stringify(completion.choices?.length ?? 0));
      return { suggestedMetrics: [], suggestedConstraints: [] };
    }

    const parsed = JSON.parse(extractJsonFromMessage(raw)) as {
      suggestedMetrics?: unknown;
      suggestedConstraints?: unknown;
    };

    const metrics = Array.isArray(parsed.suggestedMetrics)
      ? parsed.suggestedMetrics
          .filter(
            (m): m is Record<string, unknown> =>
              m != null && typeof m === "object" && typeof (m as Record<string, unknown>).name === "string" && typeof (m as Record<string, unknown>).target === "string"
          )
          .map((m) => ({
            name: String(m.name),
            currentValue: m.currentValue != null ? String(m.currentValue) : undefined,
            target: String(m.target),
            mustHave: typeof m.mustHave === "boolean" ? m.mustHave : undefined,
            reason: m.reason != null ? String(m.reason) : undefined,
          }))
          .slice(0, 5)
      : [];

    const constraints = Array.isArray(parsed.suggestedConstraints)
      ? parsed.suggestedConstraints
          .filter(
            (c): c is Record<string, unknown> =>
              c != null && typeof c === "object" && typeof (c as Record<string, unknown>).metric === "string" && typeof (c as Record<string, unknown>).threshold === "string"
          )
          .map((c) => ({
            metric: String(c.metric),
            threshold: String(c.threshold),
            owner: c.owner != null ? String(c.owner) : undefined,
            reason: c.reason != null ? String(c.reason) : undefined,
          }))
          .slice(0, 5)
      : [];

    console.log(`${LOG_PREFIX} Parsed ${metrics.length} metrics, ${constraints.length} constraints.`);
    return { suggestedMetrics: metrics, suggestedConstraints: constraints };
  } catch (err) {
    console.error(`${LOG_PREFIX} OpenAI call failed:`, err);
    return { suggestedMetrics: [], suggestedConstraints: [] };
  }
}
