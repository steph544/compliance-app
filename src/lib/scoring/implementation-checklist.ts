import {
  ProductAnswers,
  ImplementationPhase,
  ImplementationTask,
  ImplementationStepItem,
  ReleaseCriterion,
} from "./types";

/** Control summary passed into the checklist generator (one task per control). */
export interface ControlSummary {
  controlId: string;
  controlName: string;
  implementationSteps: string[];
  evidenceArtifacts: string[];
}

function steps(stepStrings: string[]): ImplementationStepItem[] {
  return stepStrings.map((step) => ({ step, assignee: undefined }));
}

export function generateImplementationChecklist(
  answers: ProductAnswers,
  controlSummaries: ControlSummary[],
  releaseCriteria: ReleaseCriterion[] = []
): ImplementationPhase[] {
  const phases: ImplementationPhase[] = [];
  const projectOwner = answers.step1?.projectOwner || "project owner";
  const upstream = answers.step4?.upstreamStakeholders || [];
  const downstream = answers.step4?.downstreamStakeholders || [];
  const upstreamList = upstream.length ? upstream.join(", ") : "relevant upstream parties";
  const downstreamList = downstream.length ? downstream.join(", ") : "relevant downstream parties";

  // Phase 1: Pre-Development
  const preDevelopmentTasks: ImplementationTask[] = [
    {
      task: "Conduct data review: inventory all data sources, assess quality, verify lawful basis for processing, and document data lineage.",
      status: "pending",
      implementationSteps: steps([
        "Inventory all data sources used by the system and document their origin and refresh cadence.",
        "Assess data quality (completeness, accuracy, timeliness) and document gaps and remediation plans.",
        "Verify lawful basis for processing for each data type and document in a processing record.",
        "Document end-to-end data lineage from ingestion to model input and output.",
      ]),
      evidence: [
        "Data inventory and source documentation",
        "Data quality assessment report",
        "Lawful basis and processing documentation",
        "Data lineage diagram or documentation",
      ],
    },
    {
      task: "Complete AI impact assessment documenting potential harms, affected stakeholders, and mitigation strategies.",
      status: "pending",
      implementationSteps: steps([
        "Identify and document potential harms (safety, fairness, privacy, transparency) specific to the use case.",
        "List affected stakeholders and how they may be impacted.",
        "Define mitigation strategies for each identified harm and assign owners.",
        "Document residual risk and acceptance criteria.",
      ]),
      evidence: [
        "AI impact assessment document",
        "Stakeholder impact analysis",
        "Mitigation and residual risk register",
      ],
    },
    {
      task: "Obtain Fit-for-AI sign-off confirming that AI is the appropriate approach for the identified problem.",
      status: "pending",
      implementationSteps: steps([
        "Document the problem statement and success criteria.",
        "Compare AI vs non-AI options and justify why AI is fit for purpose.",
        "Obtain sign-off from designated decision authority (e.g. project owner, risk).",
        "Record sign-off and any conditions in project governance records.",
      ]),
      evidence: [
        "Fit-for-AI decision record",
        "Sign-off log or approval artifact",
      ],
    },
    {
      task: "Align stakeholders: brief upstream and downstream stakeholders on project scope, risks, and governance requirements.",
      status: "pending",
      implementationSteps: steps([
        `Brief upstream stakeholders (${upstreamList}) on data and integration expectations.`,
        `Brief downstream stakeholders (${downstreamList}) on outputs, SLAs, and usage constraints.`,
        "Share project scope, risk summary, and governance requirements with all parties.",
        "Capture feedback and commitments (e.g. data availability, review cadence) in writing.",
      ]),
      evidence: [
        "Stakeholder briefing materials and attendance",
        "Record of commitments and feedback",
      ],
    },
  ];

  if (answers.step4?.inclusionConcerns && answers.step4.inclusionConcerns.length > 0) {
    const concernsList = answers.step4.inclusionConcerns.join(", ");
    preDevelopmentTasks.push({
      task: `Address inclusion concerns: ${concernsList}.`,
      status: "pending",
      implementationSteps: steps([
        "Document each inclusion concern and its impact on affected groups.",
        "Define mitigation actions (e.g. inclusive design, accessibility, fairness checks).",
        "Assign owners and timelines for each mitigation.",
        "Validate mitigations with relevant stakeholders or diversity review.",
      ]),
      evidence: [
        "Inclusion concerns and mitigation plan",
        "Stakeholder validation or sign-off where applicable",
      ],
    });
  }

  if (controlSummaries.length > 0) {
    const controlNames = controlSummaries.map((c) => c.controlName).join(", ");
    preDevelopmentTasks.push({
      task: "Map required technical controls to implementation plan.",
      status: "pending",
      implementationSteps: steps([
        `Confirm scope of required controls: ${controlNames}.`,
        "Map each control to development milestones and owners.",
        "Align control evidence and implementation steps with the development schedule.",
        "Review mapping with technical lead and risk owner.",
      ]),
      evidence: [
        "Control-to-implementation mapping document",
        "Owner and milestone assignment",
      ],
    });
  }

  phases.push({ phase: "Pre-Development", tasks: preDevelopmentTasks });

  // Phase 2: Development
  const developmentTasks: ImplementationTask[] = [
    {
      task: "Implement input validation and output filtering guardrails appropriate to the system's risk profile.",
      status: "pending",
      implementationSteps: steps([
        "Define validation rules for all inputs (format, range, allowlist) and document in spec.",
        "Implement server-side validation and reject invalid requests with clear feedback.",
        "Define output filtering rules (PII redaction, safety filters) and implement in the response path.",
        "Add logging and metrics for validation failures and filtered outputs.",
      ]),
      evidence: [
        "Input/output validation specification",
        "Guardrail implementation and test results",
      ],
    },
    {
      task: "Build testing harness covering unit tests, integration tests, adversarial tests, and bias evaluations.",
      status: "pending",
      implementationSteps: steps([
        "Implement unit tests for core logic and edge cases; maintain coverage targets.",
        "Add integration tests for data pipeline, model serving, and downstream consumers.",
        "Include adversarial and red-team tests where prompt injection or abuse is in scope.",
        "Run bias evaluations on representative data and document results and remediation.",
      ]),
      evidence: [
        "Test plan and coverage report",
        "Adversarial and bias evaluation results",
      ],
    },
    {
      task: "Create and maintain technical documentation including architecture, data flows, model specifications, and decision logic.",
      status: "pending",
      implementationSteps: steps([
        "Document system architecture (components, data flows, integration points).",
        "Document model type, version, and key specifications (inputs, outputs, limitations).",
        "Document decision logic and any business rules applied to model outputs.",
        "Keep documentation in sync with code via reviews and release gates.",
      ]),
      evidence: [
        "Architecture and data flow documentation",
        "Model card or specification",
        "Decision logic documentation",
      ],
    },
  ];

  if (answers.step7?.promptInjectionExposure) {
    developmentTasks.push({
      task: "Implement prompt injection defenses including input sanitization, output filtering, and sandboxing.",
      status: "pending",
      implementationSteps: steps([
        "Apply input sanitization (encoding, length limits, blocklists) to user-supplied content.",
        "Use output filtering to detect and block leakage of system prompts or instructions.",
        "Run untrusted or high-risk prompts in a sandboxed environment where applicable.",
        "Log and monitor injection attempts and tune defenses based on findings.",
      ]),
      evidence: [
        "Prompt injection defense design and implementation",
        "Test results and monitoring dashboard",
      ],
    });
  }

  if (answers.step7?.biasRiskCategories && answers.step7.biasRiskCategories.length > 0) {
    const categories = answers.step7.biasRiskCategories.join(", ");
    developmentTasks.push({
      task: `Implement bias testing for identified risk categories: ${categories}.`,
      status: "pending",
      implementationSteps: steps([
        `Define fairness metrics and thresholds for: ${categories}.`,
        "Select or create evaluation datasets representative of affected groups.",
        "Run bias evaluations and document disparate impact or performance gaps.",
        "Implement mitigations (e.g. data balancing, threshold tuning) and re-evaluate.",
      ]),
      evidence: [
        "Bias testing plan and results",
        "Mitigation log and re-test results",
      ],
    });
  }

  if (answers.step6?.humanAIConfig === "in_the_loop") {
    developmentTasks.push({
      task: "Build human review workflow with approval queue, override mechanism, and decision logging.",
      status: "pending",
      implementationSteps: steps([
        "Design approval queue and routing rules for AI outputs requiring human review.",
        "Implement override mechanism so reviewers can reject or correct outputs with audit trail.",
        "Log all human decisions (approve/reject/override) with timestamp and reviewer identity.",
        "Define SLAs and escalation for queue backlog and stuck items.",
      ]),
      evidence: [
        "Human-in-the-loop workflow design",
        "Override and logging implementation",
        "SLA and escalation documentation",
      ],
    });
  }

  if (answers.step6?.fallback) {
    developmentTasks.push({
      task: `Implement fallback mechanism: ${answers.step6.fallback}.`,
      status: "pending",
      implementationSteps: steps([
        "Define triggers for invoking the fallback (e.g. low confidence, errors, timeouts).",
        "Implement fallback path and ensure it meets availability and correctness requirements.",
        "Log fallback invocations and analyze for model or operational improvements.",
        "Document fallback behavior in runbook and user-facing materials where relevant.",
      ]),
      evidence: [
        "Fallback design and trigger specification",
        "Fallback invocation metrics and runbook",
      ],
    });
  }

  for (const c of controlSummaries) {
    developmentTasks.push({
      task: c.controlName,
      status: "pending",
      controlId: c.controlId,
      implementationSteps:
        c.implementationSteps.length > 0
          ? c.implementationSteps.map((step) => ({ step, assignee: undefined }))
          : steps(["Review control requirements and implement per control specification."]),
      evidence:
        c.evidenceArtifacts.length > 0
          ? c.evidenceArtifacts
          : ["Implementation and evidence per control specification."],
    });
  }

  phases.push({ phase: "Development", tasks: developmentTasks });

  // Phase 3: Pre-Deployment
  const preDeploymentTasks: ImplementationTask[] = [
    {
      task: "Run validation suite: execute full test harness and verify all tests pass against acceptance criteria.",
      status: "pending",
      implementationSteps: steps([
        "Execute full test suite (unit, integration, adversarial, bias) in pre-release environment.",
        "Verify all tests pass and no critical or high-severity issues remain open.",
        "Confirm acceptance criteria for each requirement are met and signed off.",
        "Document test run summary and any known limitations or deferred items.",
      ]),
      evidence: [
        "Test run report and pass/fail summary",
        "Acceptance criteria sign-off",
      ],
    },
    {
      task: "Finalize documentation: complete service card, data sheets, model card, and operational runbook.",
      status: "pending",
      implementationSteps: steps([
        "Complete service card (purpose, scope, limitations, owners) for the system.",
        "Finalize data sheets and model card with provenance, performance, and limitations.",
        "Write operational runbook (deployment, monitoring, incident response, rollback).",
        "Review documentation with ops and support and publish to agreed location.",
      ]),
      evidence: [
        "Service card and model card",
        "Data sheets and operational runbook",
      ],
    },
    releaseCriteria.length > 0
      ? {
          task: "Verify all release criteria are met: confirm each ROI and RAI metric meets its defined threshold.",
          status: "pending" as const,
          implementationSteps: releaseCriteria.map((c) => ({
            step: `${c.type}: ${c.metric} — threshold: ${c.threshold} (${c.authority === "block_release" ? "must pass to release" : "allow with controls"})`,
            assignee: undefined as string | undefined,
          })),
          evidence: [
            "Release criteria verification report",
            "Sign-off from criteria owners (e.g. " + projectOwner + ")",
          ],
        }
      : {
          task: "Verify all release criteria are met: confirm each ROI and RAI metric meets its defined threshold.",
          status: "pending" as const,
          implementationSteps: steps([
            "Define release criteria (ROI and RAI metrics and thresholds) if not already set.",
            "Run verification for each criterion and document results.",
            "Obtain sign-off from criteria owners before release.",
          ]),
          evidence: ["Release criteria verification and sign-off"],
        },
    {
      task: "Obtain required sign-offs from project owner, risk review, legal, and ethics board as applicable.",
      status: "pending",
      implementationSteps: steps([
        `Obtain project owner sign-off (${projectOwner}) for scope and release readiness.`,
        "Complete risk review and secure risk sign-off per org process.",
        "Complete legal and ethics review and sign-off where required by policy or regulation.",
        "Record all sign-offs and conditions in release package.",
      ]),
      evidence: [
        "Sign-off log (project owner, risk, legal, ethics as applicable)",
        "Release package with conditions if any",
      ],
    },
  ];

  if (answers.step10?.regulatoryRequirementsIdentified) {
    preDeploymentTasks.push({
      task: "Confirm all identified regulatory requirements have been addressed and documented.",
      status: "pending",
      implementationSteps: steps([
        "Review list of regulatory requirements identified in the assessment.",
        "Confirm each requirement has an implementation or compliance artifact.",
        "Document compliance evidence and map to requirements.",
        "Obtain legal or compliance sign-off if required.",
      ]),
      evidence: [
        "Regulatory requirements compliance matrix",
        "Evidence artifacts and sign-off",
      ],
    });
  }

  if (answers.step5?.crossBorderDataFlows) {
    preDeploymentTasks.push({
      task: "Verify cross-border data transfer mechanisms are in place and compliant with applicable regulations.",
      status: "pending",
      implementationSteps: steps([
        "Document all cross-border data flows (origin, destination, data type).",
        "Confirm transfer mechanisms (e.g. SCCs, adequacy) are in place and documented.",
        "Verify compliance with applicable regulations (e.g. GDPR, local law).",
        "Record verification and any residual risk in release package.",
      ]),
      evidence: [
        "Cross-border data flow inventory",
        "Transfer mechanism documentation and compliance verification",
      ],
    });
  }

  phases.push({ phase: "Pre-Deployment", tasks: preDeploymentTasks });

  // Phase 4: Post-Deployment
  const postDeploymentTasks: ImplementationTask[] = [
    {
      task: "Set up production monitoring: deploy dashboards, alerts, and logging for all key performance and safety metrics.",
      status: "pending",
      implementationSteps: steps([
        "Deploy dashboards for key performance and safety metrics defined in the monitoring spec.",
        "Configure alerts and thresholds for latency, error rate, and safety indicators.",
        "Enable structured logging for requests, model outputs, and human decisions where applicable.",
        "Validate alert routing and on-call visibility.",
      ]),
      evidence: [
        "Monitoring dashboard and alert configuration",
        "Logging and observability documentation",
      ],
    },
    {
      task: "Activate incident response procedures: verify escalation paths, on-call rotations, and communication templates are operational.",
      status: "pending",
      implementationSteps: steps([
        "Confirm escalation paths and ownership for AI-related incidents.",
        "Verify on-call rotations and contact information are current.",
        "Publish communication templates (internal and, if needed, external) for incidents.",
        "Run a tabletop or drill to validate the incident response process.",
      ]),
      evidence: [
        "Incident response runbook and escalation matrix",
        "On-call and communication template verification",
      ],
    },
    {
      task: "Conduct baseline comparison: measure production performance against pre-deployment baselines and document any deviations.",
      status: "pending",
      implementationSteps: steps([
        "Collect production metrics for the same indicators used in pre-deployment baselines.",
        "Compare production performance to baselines and document deviations.",
        "Investigate material deviations and document root cause and remediation.",
        "Update baselines or thresholds if justified and approved.",
      ]),
      evidence: [
        "Baseline comparison report",
        "Deviation analysis and remediation log",
      ],
    },
    {
      task: "Enable drift detection: configure automated monitoring for data drift, concept drift, and model performance degradation.",
      status: "pending",
      implementationSteps: steps([
        "Configure data drift detection (e.g. input distribution) and alerting.",
        "Configure concept drift and performance degradation detection and alerting.",
        "Define response playbooks for drift alerts (investigate, retrain, rollback).",
        "Review drift metrics in regular ops reviews.",
      ]),
      evidence: [
        "Drift detection configuration and playbooks",
        "Drift review and response log",
      ],
    },
  ];

  if (answers.step8?.baselineMetrics && answers.step8.baselineMetrics.length > 0) {
    for (const metric of answers.step8.baselineMetrics) {
      postDeploymentTasks.push({
        task: `Monitor "${metric.name}" against target of ${metric.target} (baseline: ${metric.currentValue}).`,
        status: "pending",
        implementationSteps: steps([
          `Define measurement method and cadence for "${metric.name}".`,
          `Set up dashboard and alerts for target: ${metric.target}.`,
          "Document baseline value and track trends; escalate if trend deviates from target.",
          "Review in regular ops or governance cadence.",
        ]),
        evidence: [
          `Monitoring configuration for ${metric.name}`,
          "Trend and escalation log",
        ],
      });
    }
  }

  if (answers.step6?.humanAIConfig === "on_the_loop") {
    postDeploymentTasks.push({
      task: "Establish spot-check sampling schedule for human review of AI outputs.",
      status: "pending",
      implementationSteps: steps([
        "Define sampling strategy (e.g. random, stratified, risk-based) and sample size.",
        "Schedule recurring spot-check reviews and assign reviewers.",
        "Implement review interface and logging for spot-check decisions.",
        "Review spot-check findings and feed into model or process improvements.",
      ]),
      evidence: [
        "Spot-check sampling plan and schedule",
        "Review interface and findings log",
      ],
    });
  }

  phases.push({ phase: "Post-Deployment", tasks: postDeploymentTasks });

  return phases;
}
