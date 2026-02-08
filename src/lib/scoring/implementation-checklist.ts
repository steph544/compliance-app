import { ProductAnswers, ImplementationPhase } from "./types";

export function generateImplementationChecklist(
  answers: ProductAnswers,
  controlIds: string[]
): ImplementationPhase[] {
  const phases: ImplementationPhase[] = [];

  // Phase 1: Pre-Development
  const preDevelopmentTasks: { task: string; status: "pending" | "in_progress" | "completed" }[] = [
    {
      task: "Conduct data review: inventory all data sources, assess quality, verify lawful basis for processing, and document data lineage.",
      status: "pending",
    },
    {
      task: "Complete AI impact assessment documenting potential harms, affected stakeholders, and mitigation strategies.",
      status: "pending",
    },
    {
      task: "Obtain Fit-for-AI sign-off confirming that AI is the appropriate approach for the identified problem.",
      status: "pending",
    },
    {
      task: "Align stakeholders: brief upstream and downstream stakeholders on project scope, risks, and governance requirements.",
      status: "pending",
    },
  ];

  if (answers.step4?.inclusionConcerns && answers.step4.inclusionConcerns.length > 0) {
    preDevelopmentTasks.push({
      task: `Address inclusion concerns: ${answers.step4.inclusionConcerns.join("; ")}.`,
      status: "pending",
    });
  }

  if (controlIds.length > 0) {
    preDevelopmentTasks.push({
      task: `Map required controls to implementation plan: ${controlIds.join(", ")}.`,
      status: "pending",
    });
  }

  phases.push({ phase: "Pre-Development", tasks: preDevelopmentTasks });

  // Phase 2: Development
  const developmentTasks: { task: string; status: "pending" | "in_progress" | "completed" }[] = [
    {
      task: "Implement input validation and output filtering guardrails appropriate to the system's risk profile.",
      status: "pending",
    },
    {
      task: "Build testing harness covering unit tests, integration tests, adversarial tests, and bias evaluations.",
      status: "pending",
    },
    {
      task: "Create and maintain technical documentation including architecture, data flows, model specifications, and decision logic.",
      status: "pending",
    },
  ];

  if (answers.step7?.promptInjectionExposure) {
    developmentTasks.push({
      task: "Implement prompt injection defenses including input sanitization, output filtering, and sandboxing.",
      status: "pending",
    });
  }

  if (answers.step7?.biasRiskCategories && answers.step7.biasRiskCategories.length > 0) {
    developmentTasks.push({
      task: `Implement bias testing for identified risk categories: ${answers.step7.biasRiskCategories.join(", ")}.`,
      status: "pending",
    });
  }

  if (answers.step6?.humanAIConfig === "in_the_loop") {
    developmentTasks.push({
      task: "Build human review workflow with approval queue, override mechanism, and decision logging.",
      status: "pending",
    });
  }

  if (answers.step6?.fallback) {
    developmentTasks.push({
      task: `Implement fallback mechanism: ${answers.step6.fallback}.`,
      status: "pending",
    });
  }

  phases.push({ phase: "Development", tasks: developmentTasks });

  // Phase 3: Pre-Deployment
  const preDeploymentTasks: { task: string; status: "pending" | "in_progress" | "completed" }[] = [
    {
      task: "Run validation suite: execute full test harness and verify all tests pass against acceptance criteria.",
      status: "pending",
    },
    {
      task: "Finalize documentation: complete service card, data sheets, model card, and operational runbook.",
      status: "pending",
    },
    {
      task: "Verify all release criteria are met: confirm each ROI and RAI metric meets its defined threshold.",
      status: "pending",
    },
    {
      task: "Obtain required sign-offs from project owner, risk review, legal, and ethics board as applicable.",
      status: "pending",
    },
  ];

  if (answers.step10?.regulatoryRequirementsIdentified) {
    preDeploymentTasks.push({
      task: "Confirm all identified regulatory requirements have been addressed and documented.",
      status: "pending",
    });
  }

  if (answers.step5?.crossBorderDataFlows) {
    preDeploymentTasks.push({
      task: "Verify cross-border data transfer mechanisms are in place and compliant with applicable regulations.",
      status: "pending",
    });
  }

  phases.push({ phase: "Pre-Deployment", tasks: preDeploymentTasks });

  // Phase 4: Post-Deployment
  const postDeploymentTasks: { task: string; status: "pending" | "in_progress" | "completed" }[] = [
    {
      task: "Set up production monitoring: deploy dashboards, alerts, and logging for all key performance and safety metrics.",
      status: "pending",
    },
    {
      task: "Activate incident response procedures: verify escalation paths, on-call rotations, and communication templates are operational.",
      status: "pending",
    },
    {
      task: "Conduct baseline comparison: measure production performance against pre-deployment baselines and document any deviations.",
      status: "pending",
    },
    {
      task: "Enable drift detection: configure automated monitoring for data drift, concept drift, and model performance degradation.",
      status: "pending",
    },
  ];

  if (answers.step8?.baselineMetrics && answers.step8.baselineMetrics.length > 0) {
    for (const metric of answers.step8.baselineMetrics) {
      postDeploymentTasks.push({
        task: `Monitor "${metric.name}" against target of ${metric.target} (baseline: ${metric.currentValue}).`,
        status: "pending",
      });
    }
  }

  if (answers.step6?.humanAIConfig === "on_the_loop") {
    postDeploymentTasks.push({
      task: "Establish spot-check sampling schedule for human review of AI outputs.",
      status: "pending",
    });
  }

  phases.push({ phase: "Post-Deployment", tasks: postDeploymentTasks });

  return phases;
}
