import { OrgAnswers } from "./types";

interface AlertDefinition {
  name: string;
  metric: string;
  condition: string;
  severity: "info" | "warning" | "critical";
  notifyChannel: string;
}

interface TriageStep {
  incident: string;
  steps: string[];
  immediateActions: string[];
}

interface EscalationTrigger {
  condition: string;
  severity: "warning" | "critical" | "emergency";
  escalateTo: string;
  timelineMinutes: number;
}

interface RunbookRole {
  role: string;
  responsibilities: string[];
  escalationAuthority: boolean;
}

interface ResponseTimeline {
  severity: "low" | "medium" | "high" | "critical";
  acknowledgmentMinutes: number;
  triageMinutes: number;
  resolutionTargetHours: number;
  communicationCadenceMinutes: number;
}

interface OperationsRunbook {
  alerts: AlertDefinition[];
  incidentTriage: TriageStep[];
  escalationTriggers: EscalationTrigger[];
  roles: RunbookRole[];
  timelines: ResponseTimeline[];
}

export function generateOperationsRunbook(
  answers: OrgAnswers,
  monitoringPlan: {
    metrics?: { name: string; threshold: string; alertCondition: string }[];
  }
): OperationsRunbook {
  // Generate alert definitions from monitoring plan metrics
  const alerts: AlertDefinition[] = [];
  const metrics = monitoringPlan?.metrics || [];

  for (const metric of metrics) {
    const severity = inferAlertSeverity(metric.name, metric.alertCondition);
    alerts.push({
      name: `Alert: ${metric.name}`,
      metric: metric.name,
      condition: metric.alertCondition || `${metric.name} breaches threshold: ${metric.threshold}`,
      severity,
      notifyChannel: severity === "critical" ? "pager + slack-critical" : "slack-alerts",
    });
  }

  // Add standard AI system alerts if not already covered
  const metricNames = metrics.map((m) => m.name.toLowerCase());

  if (!metricNames.some((n) => n.includes("drift"))) {
    alerts.push({
      name: "Alert: Model Drift Detected",
      metric: "model_drift_score",
      condition: "Drift score exceeds acceptable threshold for two consecutive measurement windows.",
      severity: "warning",
      notifyChannel: "slack-alerts",
    });
  }

  if (!metricNames.some((n) => n.includes("availability") || n.includes("uptime"))) {
    alerts.push({
      name: "Alert: System Availability Degradation",
      metric: "system_availability",
      condition: "Availability drops below 99.5% over a rolling 1-hour window.",
      severity: "critical",
      notifyChannel: "pager + slack-critical",
    });
  }

  if (!metricNames.some((n) => n.includes("latency"))) {
    alerts.push({
      name: "Alert: Inference Latency Spike",
      metric: "p95_latency_ms",
      condition: "p95 latency exceeds 2x baseline for 5 consecutive minutes.",
      severity: "warning",
      notifyChannel: "slack-alerts",
    });
  }

  // Triage steps for common AI incidents
  const incidentTriage: TriageStep[] = [
    {
      incident: "Model Drift",
      steps: [
        "Confirm drift detection alert is not a false positive by reviewing drift metrics over the past 24 hours.",
        "Identify the drift type: data drift (input distribution change) or concept drift (relationship between input and output has changed).",
        "Compare current model performance metrics against established baselines.",
        "Determine root cause: upstream data source changes, seasonal patterns, or adversarial inputs.",
        "If performance degradation is confirmed, initiate model retraining or rollback per the change management process.",
      ],
      immediateActions: [
        "Increase monitoring frequency to every 15 minutes.",
        "Notify the model owner and data engineering team.",
        "If performance drops below critical thresholds, activate fallback mechanism.",
      ],
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
      immediateActions: [
        "Document the finding with timestamps and affected population details.",
        "If bias affects high-stakes decisions, pause automated processing and route to human review.",
        "Notify legal and compliance teams within 4 hours.",
      ],
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
      immediateActions: [
        "Activate fallback mechanism immediately.",
        "Notify affected stakeholders and users via established communication channels.",
        "Page the on-call engineering team.",
      ],
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
      immediateActions: [
        "If a pattern is detected, increase human review of outputs.",
        "Notify affected downstream consumers of potentially unreliable outputs.",
        "If severity is critical, activate human-in-the-loop mode until root cause is resolved.",
      ],
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
      immediateActions: [
        "Isolate the affected system immediately.",
        "Revoke compromised credentials and API keys.",
        "Notify the CISO and security team within 15 minutes.",
        "Preserve all logs and evidence for forensic analysis.",
      ],
    },
  ];

  // Escalation triggers
  const escalationTriggers: EscalationTrigger[] = [
    {
      condition: "Model performance drops below acceptable threshold for more than 30 minutes.",
      severity: "warning",
      escalateTo: "Model Owner + Team Lead",
      timelineMinutes: 30,
    },
    {
      condition: "Bias disparity exceeds organizational tolerance in any protected category.",
      severity: "critical",
      escalateTo: "Ethics Board + Legal + Model Owner",
      timelineMinutes: 60,
    },
    {
      condition: "System availability drops below SLA for more than 15 minutes.",
      severity: "critical",
      escalateTo: "Engineering Lead + VP Engineering",
      timelineMinutes: 15,
    },
    {
      condition: "Confirmed data breach or unauthorized access to AI system or training data.",
      severity: "emergency",
      escalateTo: "CISO + General Counsel + CEO",
      timelineMinutes: 15,
    },
    {
      condition: "AI system makes a decision that causes demonstrable harm to an individual or group.",
      severity: "emergency",
      escalateTo: "Ethics Board + Legal + Executive Leadership",
      timelineMinutes: 30,
    },
    {
      condition: "Regulatory inquiry or enforcement action related to AI system.",
      severity: "emergency",
      escalateTo: "General Counsel + Chief Compliance Officer + CEO",
      timelineMinutes: 60,
    },
  ];

  // Roles from governance structure
  const roles: RunbookRole[] = [
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
    // Smaller orgs may combine roles
    roles.push({
      role: "Note: Combined Roles",
      responsibilities: [
        "In smaller organizations, the AI System Owner may also serve as the ML Engineer On-Call and Data Engineering Lead.",
        "Ensure at least two individuals are trained to handle AI incidents to avoid single points of failure.",
      ],
      escalationAuthority: false,
    });
  }

  // Response timelines by severity
  const timelines: ResponseTimeline[] = [
    {
      severity: "low",
      acknowledgmentMinutes: 240,
      triageMinutes: 480,
      resolutionTargetHours: 72,
      communicationCadenceMinutes: 1440,
    },
    {
      severity: "medium",
      acknowledgmentMinutes: 60,
      triageMinutes: 120,
      resolutionTargetHours: 24,
      communicationCadenceMinutes: 240,
    },
    {
      severity: "high",
      acknowledgmentMinutes: 15,
      triageMinutes: 60,
      resolutionTargetHours: 8,
      communicationCadenceMinutes: 60,
    },
    {
      severity: "critical",
      acknowledgmentMinutes: 5,
      triageMinutes: 15,
      resolutionTargetHours: 4,
      communicationCadenceMinutes: 30,
    },
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
