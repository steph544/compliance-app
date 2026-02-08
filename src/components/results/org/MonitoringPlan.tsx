"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";

interface Metric {
  name: string;
  description: string;
  target: string;
  frequency: string;
}

interface Alert {
  name: string;
  condition: string;
  severity: string;
  action: string;
}

interface IncidentTriage {
  severity: string;
  criteria: string;
  responseTime: string;
  owner: string;
}

interface EscalationTrigger {
  trigger: string;
  escalateTo: string;
  timeline: string;
}

interface RunbookRole {
  role: string;
  responsibilities: string;
}

interface MonitoringPlanProps {
  monitoringPlan: {
    metrics: Metric[];
    cadence: string;
    alerts: Alert[];
  };
  operationsRunbook: {
    alerts: Alert[];
    incidentTriage: IncidentTriage[];
    escalationTriggers: EscalationTrigger[];
    roles: RunbookRole[];
    timelines: string[];
  };
}

const severityColors: Record<string, string> = {
  Critical: "border-l-red-500 bg-red-50/30",
  High: "border-l-orange-500 bg-orange-50/30",
  Medium: "border-l-yellow-500 bg-yellow-50/30",
  Low: "border-l-green-500 bg-green-50/30",
};

const severityBadge: Record<string, string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

export function MonitoringPlan({
  monitoringPlan,
  operationsRunbook,
}: MonitoringPlanProps) {
  return (
    <div className="space-y-10">
      {/* Metrics */}
      <FadeIn>
        <section>
          <h3 className="text-lg font-semibold mb-4">Monitoring Metrics</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(monitoringPlan.metrics ?? []).map((metric) => (
                <TableRow
                  key={metric.name}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">{metric.name}</TableCell>
                  <TableCell className="max-w-sm whitespace-normal">
                    {metric.description}
                  </TableCell>
                  <TableCell>{metric.target}</TableCell>
                  <TableCell>{metric.frequency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </FadeIn>

      {/* Cadence */}
      <FadeIn delay={0.05}>
        <section>
          <h3 className="text-lg font-semibold mb-2">Monitoring Cadence</h3>
          <p className="text-sm text-muted-foreground">
            {monitoringPlan.cadence}
          </p>
        </section>
      </FadeIn>

      <Separator />

      {/* Operations Runbook */}
      <FadeIn delay={0.1}>
        <section>
          <h3 className="text-lg font-semibold mb-4">Operations Runbook</h3>

          {/* Alerts */}
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium mb-3">Alerts</h4>
              <StaggeredList className="grid gap-3 md:grid-cols-2">
                {(operationsRunbook.alerts ?? []).map((alert) => (
                  <StaggeredItem key={alert.name}>
                    <Card
                      className={`transition-card hover-lift border-l-4 ${severityColors[alert.severity] ?? ""}`}
                    >
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center justify-between">
                          {alert.name}
                          <Badge
                            className={
                              severityBadge[alert.severity] ??
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Condition:{" "}
                          </span>
                          {alert.condition}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Action:{" "}
                          </span>
                          {alert.action}
                        </div>
                      </CardContent>
                    </Card>
                  </StaggeredItem>
                ))}
              </StaggeredList>
            </div>

            <Separator />

            {/* Incident Triage */}
            <FadeIn delay={0.15}>
              <div>
                <h4 className="text-base font-medium mb-3">Incident Triage</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Criteria</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(operationsRunbook.incidentTriage ?? []).map((triage) => (
                      <TableRow
                        key={triage.severity}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <Badge
                            className={
                              severityBadge[triage.severity] ??
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {triage.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-sm whitespace-normal">
                          {triage.criteria}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {triage.responseTime}
                        </TableCell>
                        <TableCell>{triage.owner}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </FadeIn>

            <Separator />

            {/* Escalation Triggers */}
            <FadeIn delay={0.2}>
              <div>
                <h4 className="text-base font-medium mb-3">
                  Escalation Triggers
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Escalate To</TableHead>
                      <TableHead>Timeline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(operationsRunbook.escalationTriggers ?? []).map(
                      (trigger, index) => (
                        <TableRow
                          key={index}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="max-w-sm whitespace-normal">
                            {trigger.trigger}
                          </TableCell>
                          <TableCell>{trigger.escalateTo}</TableCell>
                          <TableCell>{trigger.timeline}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </FadeIn>

            <Separator />

            {/* Roles */}
            <FadeIn delay={0.25}>
              <div>
                <h4 className="text-base font-medium mb-3">Roles</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Responsibilities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(operationsRunbook.roles ?? []).map((role) => (
                      <TableRow
                        key={role.role}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {role.role}
                        </TableCell>
                        <TableCell className="max-w-md whitespace-normal">
                          {role.responsibilities}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </FadeIn>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
