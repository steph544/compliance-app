import type { ImplementationPhase, ImplementationTask } from "./types";
import type { ControlSummary } from "./implementation-checklist";

type TechnicalControlRow = {
  controlId?: string;
  controlName?: string;
  implementationSteps?: string[];
  aiGenerated?: boolean;
  accepted?: boolean;
  [key: string]: unknown;
};

function steps(stepStrings: string[]): { step: string; assignee?: string }[] {
  return stepStrings.map((step) => ({ step, assignee: undefined }));
}

/**
 * Map listed technical controls to ControlSummary (same shape as compute uses).
 * Listed = rule-based or AI with accepted === true.
 */
function listedControlsToSummaries(technicalControls: TechnicalControlRow[]): ControlSummary[] {
  const listed = technicalControls.filter(
    (c) => !c.aiGenerated || c.accepted === true
  );
  return listed.map((tc) => ({
    controlId: String(tc.controlId ?? ""),
    controlName: String(tc.controlName ?? tc.controlId ?? ""),
    implementationSteps: Array.isArray(tc.implementationSteps)
      ? tc.implementationSteps.filter((s): s is string => typeof s === "string")
      : [],
    evidenceArtifacts: [],
  }));
}

/**
 * Returns a new task for a control (same shape as implementation-checklist Development tasks).
 */
function taskForControl(c: ControlSummary): ImplementationTask {
  return {
    task: c.controlName || c.controlId,
    status: "pending",
    controlId: c.controlId,
    implementationSteps:
      c.implementationSteps.length > 0
        ? c.implementationSteps.map((step) => ({ step, assignee: undefined }))
        : steps(["Review control requirements and implement per control specification."]),
    evidence: ["Implementation and evidence per control specification."],
  };
}

/**
 * Sync implementation checklist so the Development phase has exactly one task per listed
 * technical control. Preserves existing task status, assignee, and content for tasks
 * that already exist for a controlId; appends new tasks for controls not yet in the checklist.
 */
export function syncChecklistWithTechnicalControls(
  technicalControls: TechnicalControlRow[],
  implementationChecklist: ImplementationPhase[]
): ImplementationPhase[] {
  const summaries = listedControlsToSummaries(technicalControls);
  const existingControlIds = new Set<string>();

  const phases = implementationChecklist.map((phase) => {
    if (phase.phase !== "Development") return phase;

    const tasks = [...phase.tasks];
    for (const task of tasks) {
      const t = task as ImplementationTask & { controlId?: string };
      if (t.controlId) existingControlIds.add(t.controlId);
    }

    for (const c of summaries) {
      if (existingControlIds.has(c.controlId)) continue;
      tasks.push(taskForControl(c));
      existingControlIds.add(c.controlId);
    }

    return { phase: phase.phase, tasks };
  });

  const hasDevelopment = phases.some((p) => p.phase === "Development");
  if (!hasDevelopment && summaries.length > 0) {
    const developmentTasks = summaries.map((c) => taskForControl(c));
    phases.push({ phase: "Development", tasks: developmentTasks });
  }

  return phases;
}
