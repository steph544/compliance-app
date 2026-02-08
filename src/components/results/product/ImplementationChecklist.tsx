"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";

interface Phase {
  phase: string;
  tasks: string[];
}

interface ImplementationChecklistProps {
  implementationChecklist: Phase[];
}

const phaseOrder = [
  "Pre-Development",
  "Development",
  "Pre-Deployment",
  "Post-Deployment",
];

const phaseColors = ["#6366f1", "#06b6d4", "#f59e0b", "#22c55e"];

export function ImplementationChecklist({
  implementationChecklist,
}: ImplementationChecklistProps) {
  const sortedPhases = [...(implementationChecklist ?? [])].sort((a, b) => {
    const indexA = phaseOrder.indexOf(a.phase);
    const indexB = phaseOrder.indexOf(b.phase);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  const totalTasks = sortedPhases.reduce(
    (sum, p) => sum + (p.tasks?.length ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Phase Stepper */}
      <FadeIn>
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

      {/* Summary */}
      <FadeIn delay={0.1}>
        <p className="text-sm text-muted-foreground text-center">
          {sortedPhases.length} phases &middot; {totalTasks} tasks total
        </p>
      </FadeIn>

      {/* Phase Cards */}
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
                  {(phase.tasks ?? []).map((task, taskIndex) => (
                    <StaggeredItem key={taskIndex}>
                      <li className="flex items-start gap-3 text-sm">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium"
                          style={{
                            backgroundColor:
                              phaseColors[phaseIndex] ?? "#94a3b8",
                          }}
                        >
                          {taskIndex + 1}
                        </span>
                        <span>{task}</span>
                      </li>
                    </StaggeredItem>
                  ))}
                </ol>
              </StaggeredList>
            </CardContent>
          </Card>
        </FadeIn>
      ))}
    </div>
  );
}
