import { ProductAnswers } from "./types";

interface HumanAIConfigResult {
  pattern: string;
  description: string;
  reasoning: string;
  requirements: string[];
}

export function recommendHumanAIConfig(answers: ProductAnswers): HumanAIConfigResult {
  const canDenyServices = answers.step4?.canDenyServices ?? false;
  const impactSeverity = answers.step4?.impactSeverity;
  const endUsers = answers.step4?.endUsers;

  // Human-in-the-loop: critical decisions or service denial capability
  if (canDenyServices || impactSeverity === "critical") {
    return {
      pattern: "human-in-the-loop",
      description:
        "A human decision-maker must review and approve every AI output before it is acted upon. The AI serves as an assistant, but a qualified human retains final authority over all decisions.",
      reasoning: canDenyServices
        ? "The system can deny services or opportunities to individuals, requiring human judgment on every decision to ensure fairness, accountability, and recourse."
        : "The impact severity is rated critical, meaning errors could cause severe or irreversible harm. Human approval of each output is necessary to mitigate this risk.",
      requirements: [
        "Train all human reviewers on the AI system's capabilities, limitations, and known failure modes.",
        "Establish clear criteria for when a human reviewer should override or reject AI recommendations.",
        "Implement a queue-based workflow where AI outputs are held pending human approval.",
        "Provide reviewers with sufficient context and source information to make independent judgments.",
        "Log all human override decisions with rationale for continuous improvement and audit purposes.",
        "Define maximum review turnaround times to prevent bottlenecks while maintaining quality.",
      ],
    };
  }

  // Human-on-the-loop: external-facing but not critical
  if (endUsers === "customers" || endUsers === "public") {
    return {
      pattern: "human-on-the-loop",
      description:
        "The AI system can operate autonomously for routine decisions, but a human monitor supervises outputs and can intervene when anomalies or edge cases are detected. The human retains the ability to override or halt the system at any time.",
      reasoning:
        "The system serves external users (customers or public), creating reputational and legal exposure, but the impact severity does not require pre-approval of every output. Continuous monitoring with intervention capability balances efficiency and safety.",
      requirements: [
        "Deploy real-time monitoring dashboards showing system performance, output distributions, and anomaly indicators.",
        "Define clear escalation thresholds that trigger mandatory human review of outputs.",
        "Provide a manual override mechanism allowing operators to halt or redirect the system immediately.",
        "Conduct periodic spot-checks of AI outputs on a sampling schedule appropriate to the risk level.",
        "Train operators to recognize signs of model drift, bias emergence, and adversarial manipulation.",
        "Maintain a feedback loop where flagged outputs are reviewed and used to improve the system.",
      ],
    };
  }

  // Human-out-of-the-loop: internal use, low-to-moderate impact
  return {
    pattern: "human-out-of-the-loop",
    description:
      "The AI system operates autonomously with periodic human review of aggregate performance. Humans set policies and constraints but do not review individual outputs. Automated safeguards and monitoring serve as the primary control mechanism.",
    reasoning:
      "The system is used internally by employees with manageable impact severity. Autonomous operation with periodic oversight is appropriate, provided automated guardrails and monitoring are in place.",
    requirements: [
      "Establish automated guardrails that constrain AI outputs within acceptable boundaries.",
      "Configure automated alerting for performance degradation, output anomalies, and threshold breaches.",
      "Schedule periodic human reviews of aggregate system performance and output quality (at minimum quarterly).",
      "Maintain audit logs of all system outputs for retrospective review if issues are identified.",
      "Define clear criteria and procedures for escalating the system to a higher oversight pattern if conditions change.",
    ],
  };
}
