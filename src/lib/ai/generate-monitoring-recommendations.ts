import OpenAI from "openai";

export interface MonitoringRecommendationsContext {
  riskTier: string;
  cadence: string;
  requiredControlsCount: number;
  metricNames: string[];
  dataPosture?: {
    pii?: boolean;
    phi?: boolean;
    biometric?: boolean;
    childrenData?: boolean;
  };
  aiUsage?: string[];
  jurisdictions?: string[];
  maturityStage?: string;
  existingGovernance?: {
    securityProgram?: boolean;
    privacyProgram?: boolean;
    modelInventory?: boolean;
    incidentResponse?: boolean;
    sdlcControls?: boolean;
  };
}

const REQUEST_TIMEOUT_MS = 15_000;

function extractJsonFromMessage(content: string): string {
  const trimmed = content.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Generate 3–6 additional monitoring/runbook recommendation bullets based on
 * assessment context. Returns [] if OPENAI_API_KEY is missing or on errors.
 */
const LOG_PREFIX = "[generate-monitoring-recommendations]";

export async function generateMonitoringRecommendations(
  context: MonitoringRecommendationsContext
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    console.log(`${LOG_PREFIX} Skipping: OPENAI_API_KEY is not set.`);
    return [];
  }

  const model =
    process.env.OPENAI_MONITORING_RECOMMENDATIONS_MODEL ||
    process.env.OPENAI_SUGGESTIONS_MODEL ||
    "gpt-4o-mini";

  const systemMessage =
    "You are an expert in AI governance, monitoring, and operations runbooks. Suggest only short, actionable recommendations that apply to monitoring, alerting, runbooks, or incident response. Each recommendation must be one sentence. Do not give generic advice; tie suggestions to the organization's risk tier, data types, jurisdictions, or governance gaps. Output valid JSON only.";

  const userMessage = `Given this assessment context, suggest 3–6 additional monitoring or runbook recommendations. Return a JSON object with one key "recommendations" that is an array of strings (each string is one recommendation sentence).

Context:
- Risk tier: ${context.riskTier}
- Recommended cadence: ${context.cadence}
- Required controls count: ${context.requiredControlsCount}
- Metrics already in plan: ${context.metricNames.join(", ") || "none"}
- Data posture: PII=${context.dataPosture?.pii ?? false}, PHI=${context.dataPosture?.phi ?? false}, biometric=${context.dataPosture?.biometric ?? false}, childrenData=${context.dataPosture?.childrenData ?? false}
- AI usage: ${(context.aiUsage ?? []).join(", ") || "not specified"}
- Jurisdictions: ${(context.jurisdictions ?? []).join(", ") || "not specified"}
- Maturity stage: ${context.maturityStage ?? "not specified"}
- Existing governance: securityProgram=${context.existingGovernance?.securityProgram ?? false}, privacyProgram=${context.existingGovernance?.privacyProgram ?? false}, incidentResponse=${context.existingGovernance?.incidentResponse ?? false}

Return JSON: { "recommendations": ["sentence one", "sentence two", ...] }`;

  console.log(`${LOG_PREFIX} Sending request to OpenAI (model=${model})...`);
  console.log(`${LOG_PREFIX} Context: riskTier=${context.riskTier}, cadence=${context.cadence}, requiredControls=${context.requiredControlsCount}, metrics=${context.metricNames.length}`);

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
      return [];
    }

    const parsed = JSON.parse(extractJsonFromMessage(raw)) as { recommendations?: unknown };
    const list = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    const result = list
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, 6);
    console.log(`${LOG_PREFIX} Parsed ${result.length} recommendations.`);
    return result;
  } catch (err) {
    console.error(`${LOG_PREFIX} OpenAI call failed:`, err);
    return [];
  }
}
