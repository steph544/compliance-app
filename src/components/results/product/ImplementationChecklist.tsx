"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";
import { ChevronRightIcon } from "lucide-react";

/** Step can be string (legacy) or { step, assignee } for assignee support. */
type StepItem = string | { step: string; assignee?: string };

type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "skipped", label: "Skipped" },
];

interface TaskItem {
  task: string;
  status?: TaskStatus;
  assignee?: string;
  implementationSteps?: StepItem[] | { step: string; assignee?: string }[];
  evidence?: string[];
  controlId?: string;
  suggestedServices?: { provider: "aws" | "azure"; service: string; description?: string }[];
}

interface Phase {
  phase: string;
  tasks: (string | TaskItem)[];
}

interface ImplementationChecklistProps {
  implementationChecklist: Phase[];
  orgAssessmentId?: string;
  productId?: string;
}

const phaseOrder = [
  "Pre-Development",
  "Development",
  "Pre-Deployment",
  "Post-Deployment",
];

const phaseColors = ["#6366f1", "#06b6d4", "#f59e0b", "#22c55e"];

function normalizeSteps(
  steps: StepItem[] | { step: string; assignee?: string }[] | undefined
): { step: string; assignee?: string }[] {
  if (!steps?.length) return [];
  return steps.map((s) =>
    typeof s === "string" ? { step: s, assignee: undefined } : { step: s.step, assignee: s.assignee }
  );
}

export function ImplementationChecklist({
  implementationChecklist,
  orgAssessmentId,
  productId,
}: ImplementationChecklistProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState<Phase[]>(() => implementationChecklist ?? []);
  const [saving, setSaving] = useState(false);

  const sortedPhases = [...checklist].sort((a, b) => {
    const indexA = phaseOrder.indexOf(a.phase);
    const indexB = phaseOrder.indexOf(b.phase);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  const totalTasks = sortedPhases.reduce(
    (sum, p) => sum + (Array.isArray(p.tasks) ? p.tasks.length : 0),
    0
  );

  const saveChecklist = useCallback(
    async (updated: Phase[]) => {
      if (!orgAssessmentId || !productId) return;
      setSaving(true);
      try {
        const res = await fetch(
          `/api/org-assessments/${orgAssessmentId}/products/${productId}/checklist`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ implementationChecklist: updated }),
          }
        );
        if (!res.ok) throw new Error("Failed to save");
        setChecklist(updated);
        router.refresh();
      } finally {
        setSaving(false);
      }
    },
    [orgAssessmentId, productId, router]
  );

  const updateTaskAssignee = useCallback(
    (phaseIndex: number, taskIndex: number, assignee: string) => {
      const phaseKey = sortedPhases[phaseIndex]?.phase;
      if (!phaseKey) return;
      const phase = sortedPhases[phaseIndex];
      if (!phase?.tasks?.[taskIndex] || typeof phase.tasks[taskIndex] === "string") return;
      const newTasks = [...phase.tasks];
      const task = newTasks[taskIndex] as TaskItem;
      newTasks[taskIndex] = { ...task, assignee: assignee || undefined };
      const newPhases = checklist.map((p) =>
        p.phase === phaseKey ? { ...p, tasks: newTasks } : p
      );
      setChecklist(newPhases);
      saveChecklist(newPhases);
    },
    [checklist, sortedPhases, saveChecklist]
  );

  const updateTaskStatus = useCallback(
    (phaseIndex: number, taskIndex: number, status: TaskStatus) => {
      const phaseKey = sortedPhases[phaseIndex]?.phase;
      if (!phaseKey) return;
      const phase = sortedPhases[phaseIndex];
      if (!phase?.tasks?.[taskIndex] || typeof phase.tasks[taskIndex] === "string") return;
      const newTasks = [...phase.tasks];
      const task = newTasks[taskIndex] as TaskItem;
      newTasks[taskIndex] = { ...task, status };
      const newPhases = checklist.map((p) =>
        p.phase === phaseKey ? { ...p, tasks: newTasks } : p
      );
      setChecklist(newPhases);
      saveChecklist(newPhases);
    },
    [checklist, sortedPhases, saveChecklist]
  );

  function getTaskText(item: string | TaskItem): string {
    return typeof item === "string" ? item : item.task;
  }

  function getTaskStatus(item: string | TaskItem): TaskItem["status"] | undefined {
    return typeof item === "string" ? undefined : item.status;
  }

  function hasSubItems(item: string | TaskItem): item is TaskItem {
    if (typeof item === "string") return false;
    const steps = (item as TaskItem).implementationSteps;
    const evidence = (item as TaskItem).evidence;
    const suggestedServices = (item as TaskItem).suggestedServices;
    return Boolean(
      (steps?.length ?? 0) > 0 ||
        (evidence?.length ?? 0) > 0 ||
        (suggestedServices?.length ?? 0) > 0
    );
  }

  const isEmpty = sortedPhases.length === 0 || totalTasks === 0;
  const canEdit = Boolean(orgAssessmentId && productId);

  return (
    <div className="space-y-6">
      <FadeIn>
        <ResultsSectionIntro
          description="Phased implementation tasks for bringing this product into compliance. Work through phases in order; use task status to track progress. Expand a task to see implementation steps and evidence; assign owners where supported."
        />
      </FadeIn>

      {isEmpty ? (
        <FadeIn delay={0.05}>
          <div className="rounded-lg border border-border bg-muted/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No implementation phases defined yet.
            </p>
          </div>
        </FadeIn>
      ) : (
        <>
          <FadeIn delay={0.05}>
            <div className="flex items-center justify-between px-4">
              {sortedPhases.map((phase, i) => (
                <div key={phase.phase} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold"
                      style={{ backgroundColor: phaseColors[i] ?? "#94a3b8" }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 text-center max-w-[80px]">
                      {phase.phase}
                    </span>
                  </div>
                  {i < sortedPhases.length - 1 && (
                    <div className="flex-1 h-0.5 bg-border mx-2 mt-[-16px]" />
                  )}
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-sm text-muted-foreground text-center">
              {sortedPhases.length} phases &middot; {totalTasks} tasks total
              {saving && " &middot; Saving…"}
            </p>
          </FadeIn>

          {sortedPhases.map((phase, phaseIndex) => (
            <FadeIn key={phase.phase} delay={0.15 + phaseIndex * 0.08}>
              <Card
                className="transition-card hover-lift overflow-hidden"
                style={{
                  borderLeft: `4px solid ${phaseColors[phaseIndex] ?? "#94a3b8"}`,
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-sm tabular-nums"
                      style={{
                        borderColor: phaseColors[phaseIndex] ?? "#94a3b8",
                        color: phaseColors[phaseIndex] ?? "#94a3b8",
                      }}
                    >
                      Phase {phaseIndex + 1}
                    </Badge>
                    {phase.phase}
                    <span className="ml-auto text-sm font-normal text-muted-foreground">
                      {(phase.tasks ?? []).length} tasks
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StaggeredList>
                    <ol className="space-y-2">
                      {(phase.tasks ?? []).map((item, taskIndex) => {
                        const taskText = getTaskText(item);
                        const status = getTaskStatus(item);
                        const showSubItems = hasSubItems(item);
                        const taskItem = typeof item === "object" ? item : null;
                        const stepItems = taskItem
                          ? normalizeSteps(taskItem.implementationSteps)
                          : [];

                        return (
                          <StaggeredItem key={taskIndex}>
                            <li className="flex items-start gap-3 text-sm">
                              <span
                                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium"
                                style={{
                                  backgroundColor: phaseColors[phaseIndex] ?? "#94a3b8",
                                }}
                              >
                                {taskIndex + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                {showSubItems && taskItem ? (
                                  <Collapsible defaultOpen={false}>
                                    <CollapsibleTrigger className="w-full flex items-center gap-2 text-left rounded-md py-1 -mx-1 hover:bg-muted/50">
                                      <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                                      <span className="font-medium flex-1">{taskText}</span>
                                      {canEdit ? (
                                        <div onClick={(e) => e.stopPropagation()}>
                                          <Select
                                            value={status ?? "pending"}
                                            onValueChange={(value) =>
                                              updateTaskStatus(phaseIndex, taskIndex, value as TaskStatus)
                                            }
                                          >
                                            <SelectTrigger className="h-7 w-[130px] text-xs border-muted" size="sm">
                                              <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {TASK_STATUS_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                  {opt.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      ) : (
                                        status && (
                                          <Badge
                                            variant={status === "skipped" ? "outline" : "secondary"}
                                            className="shrink-0 text-xs capitalize"
                                          >
                                            {status.replace("_", " ")}
                                          </Badge>
                                        )
                                      )}
                                      {canEdit && (
                                        <div
                                          className="flex items-center gap-2 shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <span className="text-muted-foreground text-xs whitespace-nowrap">
                                            Assignee:
                                          </span>
                                          <Input
                                            placeholder="Unassigned"
                                            value={taskItem.assignee ?? ""}
                                            onChange={(e) =>
                                              updateTaskAssignee(
                                                phaseIndex,
                                                taskIndex,
                                                e.target.value
                                              )
                                            }
                                            className="max-w-[180px] h-7 text-xs"
                                          />
                                        </div>
                                      )}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className="space-y-3 text-muted-foreground border-l-2 border-border pl-3 mt-2">
                                        {stepItems.length > 0 && (
                                          <div>
                                            <p className="text-xs font-medium text-foreground/80 mb-1.5">
                                              Implementation steps
                                            </p>
                                            <ol className="list-decimal list-inside space-y-0.5 text-xs">
                                              {stepItems.map((stepItem, i) => (
                                                <li key={i}>{stepItem.step}</li>
                                              ))}
                                            </ol>
                                          </div>
                                        )}
                                        {(taskItem.evidence?.length ?? 0) > 0 && (
                                          <div>
                                            <p className="text-xs font-medium text-foreground/80 mb-1">
                                              Evidence
                                            </p>
                                            <ul className="list-disc list-inside space-y-0.5 text-xs">
                                              {taskItem.evidence!.map((e, i) => (
                                                <li key={i}>{e}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {(taskItem.suggestedServices?.length ?? 0) > 0 && (
                                          <div>
                                            <p className="text-xs font-medium text-foreground/80 mb-1">
                                              Suggested services
                                            </p>
                                            <ul className="space-y-1 text-xs">
                                              {taskItem.suggestedServices!.map((svc, i) => (
                                                <li key={i}>
                                                  <span className="font-medium text-foreground/90">
                                                    {svc.provider === "aws" ? "AWS" : "Azure"}: {svc.service}
                                                  </span>
                                                  {svc.description && (
                                                    <p className="text-muted-foreground mt-0.5 pl-0">
                                                      {svc.description}
                                                    </p>
                                                  )}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                ) : (
                                  <div className="flex items-start gap-2 flex-wrap items-center py-1">
                                    <span className="font-medium">{taskText}</span>
                                    {canEdit ? (
                                      <Select
                                        value={status ?? "pending"}
                                        onValueChange={(value) =>
                                          updateTaskStatus(phaseIndex, taskIndex, value as TaskStatus)
                                        }
                                      >
                                        <SelectTrigger className="h-7 w-[130px] text-xs border-muted" size="sm">
                                          <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {TASK_STATUS_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                              {opt.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      status && (
                                        <Badge
                                          variant={status === "skipped" ? "outline" : "secondary"}
                                          className="shrink-0 text-xs capitalize"
                                        >
                                          {status.replace("_", " ")}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </li>
                          </StaggeredItem>
                        );
                      })}
                    </ol>
                  </StaggeredList>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </>
      )}
    </div>
  );
}
