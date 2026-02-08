import type { PolicyDraft } from "./types";

export function renderPolicyToMarkdown(policy: PolicyDraft): string {
  const lines: string[] = [];

  lines.push(`# ${policy.title}`);
  lines.push("");

  for (const section of policy.sections) {
    lines.push(`## ${section.title}`);
    lines.push("");
    lines.push(section.content);
    lines.push("");
  }

  return lines.join("\n");
}
