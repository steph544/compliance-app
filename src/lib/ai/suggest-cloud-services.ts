import OpenAI from "openai";

export interface ControlContext {
  controlId: string;
  controlName: string;
  description?: string;
  implementationSteps?: string[];
}

export interface AISuggestion {
  service: string;
  description?: string;
}

export interface ControlSuggestions {
  controlId: string;
  suggestions: AISuggestion[];
}

const MAX_DESCRIPTION_LENGTH = 400;
const MAX_STEPS = 2;
const REQUEST_TIMEOUT_MS = 15_000;

function truncate(str: string | undefined, maxLen: number): string {
  if (!str) return "";
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

function extractJsonFromMessage(content: string): string {
  const trimmed = content.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  return trimmed;
}

export async function suggestCloudServicesFromAI(options: {
  controlContexts: ControlContext[];
  cloudProvider: "aws" | "azure";
}): Promise<ControlSuggestions[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  const { controlContexts, cloudProvider } = options;
  if (controlContexts.length === 0) return [];

  const model = process.env.OPENAI_SUGGESTIONS_MODEL || "gpt-4o-mini";

  const payload = controlContexts.map((c) => ({
    controlId: c.controlId,
    controlName: c.controlName,
    description: truncate(c.description, MAX_DESCRIPTION_LENGTH),
    implementationSteps: (c.implementationSteps ?? []).slice(0, MAX_STEPS),
  }));

  const systemMessage =
    "You are an expert in AWS and Azure cloud services for AI governance and compliance. Suggest only real, current product names (e.g. Amazon Bedrock Guardrails, Azure AI Content Safety). Output valid JSON only.";

  const userMessage = `Given the following controls and cloud provider "${cloudProvider.toUpperCase()}", for each control suggest 0–2 additional ${cloudProvider === "aws" ? "AWS" : "Azure"} services that could help implement it. Return a JSON object with one key "items" that is an array of objects: each object has "controlId" (string) and "suggestions" (array of { "service": string, "description": string }). Only include real, current product names. Control list:\n${JSON.stringify(payload, null, 0)}`;

  const LOG_PREFIX = "[suggest-cloud-services]";
  if (!apiKey?.trim()) {
    console.log(`${LOG_PREFIX} Skipping: OPENAI_API_KEY is not set.`);
    return [];
  }
  console.log(`${LOG_PREFIX} Sending request to OpenAI (model=${model}, provider=${cloudProvider}, controls=${controlContexts.length})...`);

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
    if (raw) console.log(`${LOG_PREFIX} Raw response:`, raw);
    if (!raw) {
      console.log(`${LOG_PREFIX} No content in completion.`);
      return [];
    }

    const parsed = JSON.parse(extractJsonFromMessage(raw));
    const items = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null && Array.isArray(parsed.items)
        ? parsed.items
        : typeof parsed === "object" && parsed !== null && Array.isArray(parsed.results)
          ? parsed.results
          : [];

    const result = items
      .filter(
        (item: unknown): item is ControlSuggestions =>
          typeof item === "object" &&
          item !== null &&
          "controlId" in item &&
          typeof (item as ControlSuggestions).controlId === "string" &&
          Array.isArray((item as ControlSuggestions).suggestions)
      )
      .map((item) => ({
        controlId: item.controlId,
        suggestions: (item.suggestions || []).filter(
          (s): s is AISuggestion => typeof s === "object" && s !== null && typeof (s as AISuggestion).service === "string"
        ),
      }));
    console.log(`${LOG_PREFIX} Parsed ${result.length} control suggestion(s).`);
    return result;
  } catch (err) {
    console.error(`${LOG_PREFIX} OpenAI call failed:`, err);
    return [];
  }
}
