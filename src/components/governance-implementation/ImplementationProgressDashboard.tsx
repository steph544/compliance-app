"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Users, Calendar } from "lucide-react";
import type { SectionTracking } from "@/lib/governance-implementation/types";

interface ImplementationProgressDashboardProps {
  sections: SectionTracking[];
}

export function ImplementationProgressDashboard({
  sections,
}: ImplementationProgressDashboardProps) {
  const completed = sections.filter((s) => s.status === "COMPLETED").length;
  const inProgress = sections.filter((s) => s.status === "IN_PROGRESS").length;
  const total = sections.length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  // Count unique assigned people across all sections
  const assignedPeople = new Set<string>();
  for (const section of sections) {
    if (section.owner) assignedPeople.add(section.owner);
    const data = section.data as Record<string, unknown>;
    // Check arrays for assigned people
    for (const value of Object.values(data)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "object" && item !== null) {
            const obj = item as Record<string, unknown>;
            if (typeof obj.assignedPerson === "string" && obj.assignedPerson)
              assignedPeople.add(obj.assignedPerson);
            if (typeof obj.assignedOwner === "string" && obj.assignedOwner)
              assignedPeople.add(obj.assignedOwner);
            if (typeof obj.responsible === "string" && obj.responsible)
              assignedPeople.add(obj.responsible);
            if (typeof obj.accountable === "string" && obj.accountable)
              assignedPeople.add(obj.accountable);
            if (Array.isArray(obj.confirmedMembers)) {
              for (const m of obj.confirmedMembers) {
                if (typeof m === "string" && m) assignedPeople.add(m);
              }
            }
          }
        }
      }
      if (typeof value === "string" && data.processOwner === value && value) {
        assignedPeople.add(value);
      }
      if (typeof value === "string" && data.reviewOwner === value && value) {
        assignedPeople.add(value);
      }
    }
  }

  // Find nearest due date
  const dueDates = sections
    .filter((s) => s.dueDate && s.status !== "COMPLETED")
    .map((s) => s.dueDate!)
    .sort();
  const nextDue = dueDates[0] ?? null;

  return (
    <Card className="mb-8 border-2">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Implementation Progress</h3>
          <Badge
            variant={completed === total ? "default" : "secondary"}
            className="text-sm"
          >
            {Math.round(progressPercent)}% Complete
          </Badge>
        </div>
        <Progress value={progressPercent} className="mb-6 h-2" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {completed}/{total}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {assignedPeople.size}
              </p>
              <p className="text-xs text-muted-foreground">People Assigned</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold tabular-nums">
                {nextDue
                  ? new Date(nextDue).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Next Due</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
