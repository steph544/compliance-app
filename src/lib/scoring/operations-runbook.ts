import {
  OrgAnswers,
  type MonitoringPlanData,
  type RunbookAlert,
  type RunbookIncidentTriage,
  type RunbookEscalationTrigger,
  type RunbookRole as RunbookRoleData,
  type OperationsRunbookData,
} from "./types";

// Internal metric shape (supports both legacy and canonical)
interface MetricInput {
  name: string;
  threshold?: string;
  target?: string;
  alertCondition?: string;
  description?: string;
  frequency?: string;
}

export function generateOperationsRunbook(
  answers: OrgAnswers,
  monitoringPlan: MonitoringPlanData | { metrics?: MetricInput[]; cadence?: string; alertsSummary?: string }
): OperationsRunbookData {
  const metrics = monitoringPlan?.metrics || [];
  const alerts: RunbookAlert[] = [];

  for (const metric of metrics) {
    const m = metric as { target?: string; threshold?: string; alertCondition?: string };
    const condition =
      m.alertCondition ||
      `Breaches target: ${m.target ?? m.threshold ?? "see description"}`;
    const severity = inferAlertSeverity(metric.name, condition);
    const severityLabel = severity.charAt(0).toUpperCase() + severity.slice(1);
    alerts.push({
      name: `Alert: ${metric.name}`,
      condition,
      severity: severityLabel,
      action: severity === "critical" ? "pager + slack-critical" : "slack-alerts",
    });
  }

  // Add standard AI system alerts if not already covered
  const metricNames = metrics.map((m) => m.name.toLowerCase());

  if (!metricNames.some((n) => n.includes("drift"))) {
    alerts.push({
      name: "Alert: Model Drift Detected",
      condition: "Drift score exceeds acceptable threshold for two consecutive measurement windows.",
      severity: "Warning",
      action: "slack-alerts",
    });
  }

  if (!metricNames.some((n) => n.includes("availability") || n.includes("uptime"))) {
    alerts.push({
      name: "Alert: System Availability Degradation",
      condition: "Availability drops below 99.5% over a rolling 1-hour window.",
      severity: "Critical",
      action: "pager + slack-critical",
    });
  }

  if (!metricNames.some((n) => n.includes("latency"))) {
    alerts.push({
      name: "Alert: Inference Latency Spike",
      condition: "p95 latency exceeds 2x baseline for 5 consecutive minutes.",
      severity: "Warning",
      action: "slack-alerts",
    });
  }

  // Triage steps for common AI incidents (canonical shape: severity, criteria, responseTime, owner)
  const incidentTriageData: { incident: string; steps: string[]; severity: string; responseTime: string; owner: string }[] = [
    {
      incident: "Model Drift",
      steps: [
        "Confirm drift detection alert is not a false positive by reviewing drift metrics over the past 24 hours.",
        "Identify the drift type: data drift (input distribution change) or concept drift (relationship between input and output has changed).",
        "Compare current model performance metrics against established baselines.",
        "Determine root cause: upstream data source changes, seasonal patterns, or adversarial inputs.",
        "If performance degradation is confirmed, initiate model retraining or rollback per the change management process.",
      ],
      severity: "High",
      responseTime: "60 min triage",
      owner: "ML Engineer On-Call",
    },
    {
      incident: "Bias Detection",
      steps: [
        "Review the bias alert details: which protected group, which metric, and the magnitude of disparity.",
        "Pull a sample of recent predictions for manual review across affected groups.",
        "Determine whether the bias is a data issue, model issue, or pre-existing pattern in the training data.",
        "Assess the legal and reputational impact of the detected bias.",
        "Engage the ethics review board if the disparity exceeds organizational tolerance thresholds.",
      ],
      severity: "Critical",
      responseTime: "4 hours",
      owner: "AI Ethics / Responsible AI Lead",
    },
    {
      incident: "Availability Outage",
      steps: [
        "Confirm the outage scope: full system, partial, or specific endpoints.",
        "Check infrastructure status: compute resources, API endpoints, model serving layer, and dependencies.",
        "Review recent deployments or configuration changes that may have caused the outage.",
        "Activate the fallback or degraded-mode processing if available.",
        "Coordinate restoration efforts and establish estimated time to recovery.",
      ],
      severity: "Critical",
      responseTime: "15 min",
      owner: "Engineering Lead",
    },
    {
      incident: "Hallucination / Incorrect Output",
      steps: [
        "Collect and document the specific incorrect outputs with full context (input, output, timestamp).",
        "Determine the scope: isolated incident or systematic pattern.",
        "Review the input for signs of prompt injection or adversarial manipulation.",
        "Check if the issue correlates with recent model updates, data changes, or infrastructure changes.",
        "Assess downstream impact: were any decisions or actions taken based on the incorrect output?",
      ],
      severity: "High",
      responseTime: "2 hours",
      owner: "AI System Owner",
    },
    {
      incident: "Security Breach / Adversarial Attack",
      steps: [
        "Isolate the affected system components to prevent further exploitation.",
        "Capture forensic evidence: logs, network traffic, and system state.",
        "Identify the attack vector: prompt injection, data poisoning, model extraction, or other.",
        "Assess data exposure: was any sensitive data accessed, exfiltrated, or corrupted?",
        "Engage the security incident response team and follow the organization's security IR plan.",
      ],
      severity: "Critical",
      responseTime: "15 min",
      owner: "Security Incident Responder",
    },
  ];

  const incidentTriage: RunbookIncidentTriage[] = incidentTriageData.map((t) => ({
    severity: t.severity,
    criteria: `${t.incident}: ${t.steps[0]}`,
    responseTime: t.responseTime,
    owner: t.owner,
  }));

  // Escalation triggers (canonical: trigger, escalateTo, timeline)
  const escalationTriggersData: { condition: string; escalateTo: string; timelineMinutes: number }[] = [
    {
      condition: "Model performance drops below acceptable threshold for more than 30 minutes.",
      escalateTo: "Model Owner + Team Lead",
      timelineMinutes: 30,
    },
    {
      condition: "Bias disparity exceeds organizational tolerance in any protected category.",
      escalateTo: "Ethics Board + Legal + Model Owner",
      timelineMinutes: 60,
    },
    {
      condition: "System availability drops below SLA for more than 15 minutes.",
      escalateTo: "Engineering Lead + VP Engineering",
      timelineMinutes: 15,
    },
    {
      condition: "Confirmed data breach or unauthorized access to AI system or training data.",
      escalateTo: "CISO + General Counsel + CEO",
      timelineMinutes: 15,
    },
    {
      condition: "AI system makes a decision that causes demonstrable harm to an individual or group.",
      escalateTo: "Ethics Board + Legal + Executive Leadership",
      timelineMinutes: 30,
    },
    {
      condition: "Regulatory inquiry or enforcement action related to AI system.",
      escalateTo: "General Counsel + Chief Compliance Officer + CEO",
      timelineMinutes: 60,
    },
  ];

  const escalationTriggers: RunbookEscalationTrigger[] = escalationTriggersData.map((e) => ({
    trigger: e.condition,
    escalateTo: e.escalateTo,
    timeline: `${e.timelineMinutes} min`,
  }));

  // Roles from governance structure (canonical: role, responsibilities as string)
  interface InternalRole {
    role: string;
    responsibilities: string[];
    escalationAuthority: boolean;
  }
  const rolesData: InternalRole[] = [
    {
      role: "AI System Owner",
      responsibilities: [
        "Maintain overall accountability for the AI system's performance and compliance.",
        "Approve changes to model configuration, data inputs, and deployment parameters.",
        "Serve as primary point of contact for incidents involving the AI system.",
        "Ensure the system's service card and documentation remain current.",
      ],
      escalationAuthority: true,
    },
    {
      role: "ML Engineer On-Call",
      responsibilities: [
        "Respond to system alerts and triage incidents during on-call rotation.",
        "Perform initial diagnosis of model performance issues, drift, and availability problems.",
        "Execute approved runbook procedures for common incident types.",
        "Escalate to the AI System Owner when incidents exceed on-call authority.",
      ],
      escalationAuthority: false,
    },
    {
      role: "Data Engineering Lead",
      responsibilities: [
        "Monitor data pipeline health and data quality metrics.",
        "Investigate data-related root causes for model drift or performance degradation.",
        "Coordinate data fixes and reprocessing as needed.",
      ],
      escalationAuthority: false,
    },
    {
      role: "AI Ethics / Responsible AI Lead",
      responsibilities: [
        "Review and adjudicate bias-related incidents and fairness concerns.",
        "Advise on ethical implications of system behavior and proposed mitigations.",
        "Coordinate with legal on regulatory and compliance matters.",
      ],
      escalationAuthority: true,
    },
    {
      role: "Security Incident Responder",
      responsibilities: [
        "Lead response to security incidents involving the AI system.",
        "Coordinate forensic analysis and evidence preservation.",
        "Interface with the broader security operations center (SOC).",
      ],
      escalationAuthority: true,
    },
  ];

  // Adjust roles based on org size
  if (answers.step1?.orgSize === "1-50" || answers.step1?.orgSize === "51-500") {
    rolesData.push({
      role: "Note: Combined Roles",
      responsibilities: [
        "In smaller organizations, the AI System Owner may also serve as the ML Engineer On-Call and Data Engineering Lead.",
        "Ensure at least two individuals are trained to handle AI incidents to avoid single points of failure.",
      ],
      escalationAuthority: false,
    });
  }

  const roles: RunbookRoleData[] = rolesData.map((r) => ({
    role: r.role,
    responsibilities: r.responsibilities.join("\n"),
  }));

  // Response timelines as human-readable strings
  const timelines: string[] = [
    "Low: 4h ack, 8h triage, 72h resolution",
    "Medium: 1h ack, 2h triage, 24h resolution",
    "High: 15 min ack, 1h triage, 8h resolution",
    "Critical: 5 min ack, 15 min triage, 4h resolution",
  ];

  return {
    alerts,
    incidentTriage,
    escalationTriggers,
    roles,
    timelines,
  };
}

function inferAlertSeverity(
  metricName: string,
  alertCondition: string
): "info" | "warning" | "critical" {
  const lowerName = metricName.toLowerCase();
  const lowerCondition = alertCondition.toLowerCase();

  if (
    lowerName.includes("availability") ||
    lowerName.includes("security") ||
    lowerName.includes("breach") ||
    lowerCondition.includes("critical") ||
    lowerCondition.includes("emergency")
  ) {
    return "critical";
  }

  if (
    lowerName.includes("drift") ||
    lowerName.includes("bias") ||
    lowerName.includes("latency") ||
    lowerName.includes("error") ||
    lowerCondition.includes("warning") ||
    lowerCondition.includes("degrad")
  ) {
    return "warning";
  }

  return "info";
}
