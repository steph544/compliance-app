import OpenAI from "openai";
import type { ProductContextForAI } from "./product-context-for-ai";

export type TechnicalControlSuggestionsContext = ProductContextForAI & {
  riskTier: string;
  existingControlNames: string[];
};

export interface SuggestedTechnicalControl {
  name: string;
  description: string;
  designation: "REQUIRED" | "RECOMMENDED" | "OPTIONAL";
  reason: string;
  implementationSteps?: string[];
}

const REQUEST_TIMEOUT_MS = 15_000;

function extractJsonFromMessage(content: string): string {
  const trimmed = content.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  return trimmed;
}

const LOG_PREFIX = "[generate-technical-control-recommendations]";

const ns = (s: string) => (s?.trim() ? s.trim() : "not specified");
const arr = (a: string[]) => (Array.isArray(a) && a.length > 0 ? a.join(", ") : "none");

function buildUserMessage(context: TechnicalControlSuggestionsContext, count: 1 | 2 | 3 | 4 | 5 | 6): string {
  const countLine = count === 1
    ? "Suggest exactly 1 additional technical control."
    : `Suggest ${count}–${Math.min(6, count + 2)} additional technical controls.`;

  return `Given this full product assessment context, ${countLine} Do NOT suggest anything that duplicates the existing control names below.

Project overview:
- Project name: ${context.projectName}
- Description: ${ns(context.description)}
- Business objective: ${ns(context.businessObjective)}
- Project stage: ${context.projectStage}
- Department: ${context.department}
- Project owner: ${ns(context.projectOwner)}
- Risk tier: ${context.riskTier}

Fit-for-AI:
- Could solve without AI: ${context.couldSolveWithoutAI}
- AI material advantage: ${context.aiMaterialAdvantage}
- Worst case impact: ${context.worstCaseImpact}
- Build/integrate/buy: ${context.buildIntegrateBuy}

AI system details:
- AI type(s): ${arr(context.aiType)}
- Model source: ${context.modelSource}

Use case & impact:
- End users: ${context.endUsers}
- Decisions: ${ns(context.decisions)}
- Can deny services/benefits: ${context.canDenyServices}
- Impact severity: ${context.impactSeverity}
- Affected population: ${context.affectedPopulation}

Data & privacy:
- Data types: ${arr(context.dataTypes)}
- Data sources: ${arr(context.dataSources)}

Technical architecture:
- Human-in-the-loop: ${context.humanAIConfig}
- Model size: ${context.modelSize}
- Inference volume: ${context.inferenceVolume}

Risk & threat:
- Prompt injection exposure: ${context.promptInjectionExposure}
- Hallucination risk: ${context.hallucinationRisk}
- Bias risk categories: ${arr(context.biasRiskCategories)}
- Regulatory risks: ${arr(context.regulatoryRisks)}

Existing control names (do not duplicate): ${arr(context.existingControlNames)}

Return a JSON object with one key "suggestedControls" that is an array of objects. Each object must have:
- "name" (string): short control name
- "description" (string): what the control does
- "designation" (string): one of "REQUIRED", "RECOMMENDED", "OPTIONAL"
- "reason" (string): why this applies to this project ("why this applies")
- "implementationSteps" (array of strings): 2–5 concrete implementation guide steps

Example: { "suggestedControls": [{ "name": "Input validation layer", "description": "Validate and sanitize all user inputs before model invocation.", "designation": "REQUIRED", "reason": "Project accepts external input; prevents prompt injection.", "implementationSteps": ["Define input schema for each endpoint", "Validate length and format", "Block known attack patterns"] }] }`;
}

/**
 * Generate 2–6 (or 1 if count=1) additional technical control suggestions from project context.
 * Returns [] when OPENAI_API_KEY is missing or on errors.
 */
export async function generateTechnicalControlRecommendations(
  context: TechnicalControlSuggestionsContext,
  options?: { count?: 1 | 2 | 3 | 4 | 5 | 6 }
): Promise<SuggestedTechnicalControl[]> {
  const count = options?.count ?? 2;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    console.log(`${LOG_PREFIX} Skipping: OPENAI_API_KEY is not set.`);
    return [];
  }

  const model =
    process.env.OPENAI_TECHNICAL_CONTROL_SUGGESTIONS_MODEL ||
    process.env.OPENAI_SUGGESTIONS_MODEL ||
    "gpt-4o-mini";

  const systemMessage =
    "You are an expert in AI governance and technical controls. Suggest only concrete, implementable technical controls that apply to the given product context. Do not duplicate any existing control names you are given. Each suggestion must include a short reason (why this applies) and 2–5 implementation steps. Output valid JSON only.";

  const userMessage = buildUserMessage(context, count);

  console.log(`${LOG_PREFIX} Sending request to OpenAI (model=${model}, count=${count})...`);
  console.log(`${LOG_PREFIX} Context: project=${context.projectName}, riskTier=${context.riskTier}, existingControls=${context.existingControlNames.length}`);

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
      console.log(`${LOG_PREFIX} No content in completion.`);
      return [];
    }

    const parsed = JSON.parse(extractJsonFromMessage(raw)) as { suggestedControls?: unknown };

    const list = Array.isArray(parsed.suggestedControls) ? parsed.suggestedControls : [];
    const result = list
      .filter(
        (c): c is Record<string, unknown> =>
          c != null &&
          typeof c === "object" &&
          typeof (c as Record<string, unknown>).name === "string" &&
          typeof (c as Record<string, unknown>).description === "string" &&
          typeof (c as Record<string, unknown>).designation === "string" &&
          typeof (c as Record<string, unknown>).reason === "string"
      )
      .map((c) => {
        const designation = String(c.designation).toUpperCase();
        const validDesignation =
          designation === "REQUIRED" || designation === "RECOMMENDED" || designation === "OPTIONAL"
            ? designation
            : "RECOMMENDED";
        return {
          name: String(c.name),
          description: String(c.description),
          designation: validDesignation as "REQUIRED" | "RECOMMENDED" | "OPTIONAL",
          reason: String(c.reason),
          implementationSteps: Array.isArray(c.implementationSteps)
            ? c.implementationSteps.filter((s): s is string => typeof s === "string")
            : undefined,
        };
      })
      .slice(0, 6);

    console.log(`${LOG_PREFIX} Parsed ${result.length} controls.`);
    return result;
  } catch (err) {
    console.error(`${LOG_PREFIX} OpenAI call failed:`, err);
    return [];
  }
}
