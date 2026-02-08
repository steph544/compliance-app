"use client";

import { useState, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  MonitoringPlanData,
  OperationsRunbookData,
  MonitoringMetric,
  RunbookAlert,
  RunbookIncidentTriage,
  RunbookEscalationTrigger,
  RunbookRole,
} from "@/lib/scoring/types";

interface MonitoringPlanProps {
  monitoringPlan: MonitoringPlanData;
  operationsRunbook: OperationsRunbookData;
  assessmentId: string;
  riskTier?: string;
  requiredControlsCount?: number;
}

const severityColors: Record<string, string> = {
  Critical: "border-l-slate-600 bg-slate-50/30 dark:bg-slate-900/30",
  High: "border-l-orange-500 bg-orange-50/30",
  Medium: "border-l-yellow-500 bg-yellow-50/30",
  Low: "border-l-green-500 bg-green-50/30",
  Warning: "border-l-yellow-500 bg-yellow-50/30",
  Info: "border-l-blue-500 bg-blue-50/30",
};

const severityBadge: Record<string, string> = {
  Critical: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
  Warning: "bg-yellow-100 text-yellow-800",
  Info: "bg-blue-100 text-blue-800",
};

const defaultMetric: MonitoringMetric = {
  name: "",
  description: "",
  target: "",
  frequency: "Monthly",
};

const defaultAlert: RunbookAlert = {
  name: "",
  condition: "",
  severity: "Warning",
  action: "slack-alerts",
};

const defaultTriage: RunbookIncidentTriage = {
  severity: "High",
  criteria: "",
  responseTime: "1h",
  owner: "",
};

const defaultEscalation: RunbookEscalationTrigger = {
  trigger: "",
  escalateTo: "",
  timeline: "30 min",
};

const defaultRole: RunbookRole = {
  role: "",
  responsibilities: "",
};

export function MonitoringPlan({
  monitoringPlan: initialPlan,
  operationsRunbook: initialRunbook,
  assessmentId,
  riskTier,
  requiredControlsCount,
}: MonitoringPlanProps) {
  const [plan, setPlan] = useState<MonitoringPlanData>(() => ({
    metrics: initialPlan.metrics?.length ? initialPlan.metrics : [defaultMetric],
    cadence: initialPlan.cadence ?? "",
    alertsSummary: initialPlan.alertsSummary ?? (initialPlan as { alerts?: string }).alerts ?? "",
    recommendationBullets: initialPlan.recommendationBullets,
  }));
  const [runbook, setRunbook] = useState<OperationsRunbookData>(() => ({
    alerts: initialRunbook.alerts ?? [],
    incidentTriage: initialRunbook.incidentTriage ?? [],
    escalationTriggers: initialRunbook.escalationTriggers ?? [],
    roles: initialRunbook.roles ?? [],
    timelines: initialRunbook.timelines ?? [],
  }));
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveStatus("idle");
    setSaveMessage("");
    try {
      const res = await fetch(`/api/org-assessments/${assessmentId}/monitoring`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monitoringPlan: plan, operationsRunbook: runbook }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Save failed: ${res.status}`);
      }
      setSaveStatus("success");
      setSaveMessage("Monitoring plan saved.");
    } catch (e) {
      setSaveStatus("error");
      setSaveMessage(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [assessmentId, plan, runbook]);

  const updatePlan = useCallback((updates: Partial<MonitoringPlanData>) => {
    setPlan((p) => ({ ...p, ...updates }));
  }, []);

  const updateRunbook = useCallback((updates: Partial<OperationsRunbookData>) => {
    setRunbook((r) => ({ ...r, ...updates }));
  }, []);

  const addMetric = () => setPlan((p) => ({ ...p, metrics: [...(p.metrics ?? []), { ...defaultMetric }] }));

  const addRecommendationAsMetric = useCallback(
    (bulletText: string) => {
      const name =
        bulletText.length <= 40 ? bulletText : bulletText.slice(0, 37).trim() + "...";
      setPlan((p) => ({
        ...p,
        metrics: [
          ...(p.metrics ?? []),
          {
            name: name || "From recommendation",
            description: bulletText,
            target: "",
            frequency: p.cadence?.trim() || "Monthly",
          },
        ],
      }));
    },
    []
  );

  const removeMetric = (index: number) =>
    setPlan((p) => ({
      ...p,
      metrics: p.metrics.filter((_, i) => i !== index),
    }));
  const updateMetric = (index: number, m: Partial<MonitoringMetric>) =>
    setPlan((p) => ({
      ...p,
      metrics: p.metrics.map((x, i) => (i === index ? { ...x, ...m } : x)),
    }));

  const addAlert = () => updateRunbook({ alerts: [...runbook.alerts, { ...defaultAlert }] });
  const removeAlert = (index: number) =>
    updateRunbook({ alerts: runbook.alerts.filter((_, i) => i !== index) });
  const updateAlert = (index: number, a: Partial<RunbookAlert>) =>
    updateRunbook({
      alerts: runbook.alerts.map((x, i) => (i === index ? { ...x, ...a } : x)),
    });

  const addTriage = () =>
    updateRunbook({ incidentTriage: [...runbook.incidentTriage, { ...defaultTriage }] });
  const removeTriage = (index: number) =>
    updateRunbook({ incidentTriage: runbook.incidentTriage.filter((_, i) => i !== index) });
  const updateTriage = (index: number, t: Partial<RunbookIncidentTriage>) =>
    updateRunbook({
      incidentTriage: runbook.incidentTriage.map((x, i) => (i === index ? { ...x, ...t } : x)),
    });

  const addEscalation = () =>
    updateRunbook({ escalationTriggers: [...runbook.escalationTriggers, { ...defaultEscalation }] });
  const removeEscalation = (index: number) =>
    updateRunbook({ escalationTriggers: runbook.escalationTriggers.filter((_, i) => i !== index) });
  const updateEscalation = (index: number, e: Partial<RunbookEscalationTrigger>) =>
    updateRunbook({
      escalationTriggers: runbook.escalationTriggers.map((x, i) =>
        i === index ? { ...x, ...e } : x
      ),
    });

  const addRole = () => updateRunbook({ roles: [...runbook.roles, { ...defaultRole }] });
  const removeRole = (index: number) =>
    updateRunbook({ roles: runbook.roles.filter((_, i) => i !== index) });
  const updateRole = (index: number, r: Partial<RunbookRole>) =>
    updateRunbook({
      roles: runbook.roles.map((x, i) => (i === index ? { ...x, ...r } : x)),
    });

  return (
    <div className="space-y-10">
      {/* Recommendations callout (from compute or fallback from props) */}
      {(plan.recommendationBullets?.length ?? 0) > 0 ? (
        <FadeIn>
          <Card className="border-muted bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Based on your assessment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <TooltipProvider>
                <ul className="list-disc list-inside space-y-1.5">
                  {plan.recommendationBullets!.map((bullet, i) => {
                    const text = typeof bullet === "string" ? bullet : bullet.text;
                    const isAiGenerated = typeof bullet === "object" && bullet.aiGenerated;
                    return (
                      <li key={i} className="flex items-start gap-2 group/list-item">
                        <span className="flex-1 min-w-0">
                          {text}
                          {isAiGenerated && (
                            <Badge
                              variant="secondary"
                              className="ml-2 text-[10px] font-normal px-1.5 py-0"
                            >
                              AI
                            </Badge>
                          )}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              className="shrink-0 rounded-full shadow-sm"
                              onClick={() => addRecommendationAsMetric(text)}
                            >
                              Add to plan
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Add to Monitoring Metrics
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  })}
                </ul>
              </TooltipProvider>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (riskTier || requiredControlsCount != null) && (
        <FadeIn>
          <Card className="border-muted bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Based on your assessment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {riskTier && (
                <p>
                  Your risk tier is <strong>{riskTier}</strong>, so we recommend the monitoring
                  cadence and response timelines below. You can adjust them to fit your team.
                </p>
              )}
              {requiredControlsCount != null && requiredControlsCount > 10 && (
                <p>
                  With <strong>{requiredControlsCount} required controls</strong>, we suggest
                  using PagerDuty or OpsGenie for critical AI alerts (or update the Alerting
                  summary below).
                </p>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Metrics */}
      <FadeIn>
        <section>
          <h3 className="text-lg font-semibold mb-2">Monitoring Metrics</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Set metrics your team will track regularly. Add or edit rows below.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(plan.metrics ?? []).map((metric, index) => (
                <TableRow key={index} className="align-top">
                  <TableCell>
                    <Input
                      value={metric.name}
                      onChange={(e) => updateMetric(index, { name: e.target.value })}
                      placeholder="e.g. Model accuracy"
                      className="font-medium"
                    />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <Input
                      value={metric.description}
                      onChange={(e) => updateMetric(index, { description: e.target.value })}
                      placeholder="Description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={metric.target}
                      onChange={(e) => updateMetric(index, { target: e.target.value })}
                      placeholder="Target"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={metric.frequency}
                      onChange={(e) => updateMetric(index, { frequency: e.target.value })}
                      placeholder="e.g. Weekly"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMetric(index)}
                      disabled={(plan.metrics?.length ?? 0) <= 1}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addMetric}>
            Add metric
          </Button>
        </section>
      </FadeIn>

      {/* Cadence & Alerting */}
      <FadeIn delay={0.05}>
        <section>
          <h3 className="text-lg font-semibold mb-2">Monitoring Cadence</h3>
          <p className="text-sm text-muted-foreground mb-2">
            How often the governance team will review monitoring and metrics.
          </p>
          <Textarea
            value={plan.cadence}
            onChange={(e) => updatePlan({ cadence: e.target.value })}
            placeholder="e.g. Weekly monitoring with monthly governance review"
            rows={2}
            className="max-w-2xl"
          />
          <div className="mt-4">
            <label className="text-sm font-medium block mb-2">Alerting summary</label>
            <Input
              value={plan.alertsSummary ?? ""}
              onChange={(e) => updatePlan({ alertsSummary: e.target.value })}
              placeholder="e.g. Email notifications for governance team"
              className="max-w-2xl"
            />
          </div>
        </section>
      </FadeIn>

      <Separator />

      {/* Operations Runbook */}
      <FadeIn delay={0.1}>
        <section>
          <h3 className="text-lg font-semibold mb-4">Operations Runbook</h3>

          <div className="space-y-6">
            {/* Alerts */}
            <div>
              <h4 className="text-base font-medium mb-2">Alerts</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Define alert conditions and how the team is notified.
              </p>
              <StaggeredList className="grid gap-3 md:grid-cols-2">
                {(runbook.alerts ?? []).map((alert, index) => (
                  <StaggeredItem key={index}>
                    <Card
                      className={`border-l-4 ${severityColors[alert.severity] ?? ""}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            value={alert.name}
                            onChange={(e) => updateAlert(index, { name: e.target.value })}
                            placeholder="Alert name"
                            className="text-sm font-medium border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                          />
                          <div className="flex items-center gap-1">
                            <select
                              value={alert.severity}
                              onChange={(e) =>
                                updateAlert(index, { severity: e.target.value })
                              }
                              className="text-xs rounded border bg-background px-2 py-1"
                            >
                              {["Info", "Warning", "Critical", "High", "Medium", "Low"].map(
                                (s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                )
                              )}
                            </select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => removeAlert(index)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <label className="text-muted-foreground">Condition</label>
                          <Input
                            value={alert.condition}
                            onChange={(e) =>
                              updateAlert(index, { condition: e.target.value })
                            }
                            placeholder="When to fire"
                            className="mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground">Action</label>
                          <Input
                            value={alert.action}
                            onChange={(e) => updateAlert(index, { action: e.target.value })}
                            placeholder="e.g. slack-alerts"
                            className="mt-0.5"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </StaggeredItem>
                ))}
              </StaggeredList>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addAlert}
              >
                Add alert
              </Button>
            </div>

            <Separator />

            {/* Incident Triage */}
            <div>
              <h4 className="text-base font-medium mb-2">Incident Triage</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Severity, criteria, response time, and owner for each incident type.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(runbook.incidentTriage ?? []).map((triage, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={triage.severity}
                          onChange={(e) =>
                            updateTriage(index, { severity: e.target.value })
                          }
                          placeholder="High"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <Input
                          value={triage.criteria}
                          onChange={(e) =>
                            updateTriage(index, { criteria: e.target.value })
                          }
                          placeholder="Criteria"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={triage.responseTime}
                          onChange={(e) =>
                            updateTriage(index, { responseTime: e.target.value })
                          }
                          placeholder="e.g. 1h"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={triage.owner}
                          onChange={(e) =>
                            updateTriage(index, { owner: e.target.value })
                          }
                          placeholder="Owner"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTriage(index)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addTriage}
              >
                Add row
              </Button>
            </div>

            <Separator />

            {/* Escalation Triggers */}
            <div>
              <h4 className="text-base font-medium mb-2">Escalation Triggers</h4>
              <p className="text-sm text-muted-foreground mb-3">
                When to escalate and to whom, with timeline.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Escalate To</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(runbook.escalationTriggers ?? []).map((trigger, index) => (
                    <TableRow key={index}>
                      <TableCell className="max-w-sm">
                        <Input
                          value={trigger.trigger}
                          onChange={(e) =>
                            updateEscalation(index, { trigger: e.target.value })
                          }
                          placeholder="Condition"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={trigger.escalateTo}
                          onChange={(e) =>
                            updateEscalation(index, { escalateTo: e.target.value })
                          }
                          placeholder="Role or team"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={trigger.timeline}
                          onChange={(e) =>
                            updateEscalation(index, { timeline: e.target.value })
                          }
                          placeholder="e.g. 30 min"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEscalation(index)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addEscalation}
              >
                Add row
              </Button>
            </div>

            <Separator />

            {/* Roles */}
            <div>
              <h4 className="text-base font-medium mb-2">Roles</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Roles and responsibilities for the runbook.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Responsibilities</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(runbook.roles ?? []).map((role, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <Input
                          value={role.role}
                          onChange={(e) =>
                            updateRole(index, { role: e.target.value })
                          }
                          placeholder="Role name"
                        />
                      </TableCell>
                      <TableCell className="max-w-md">
                        <Textarea
                          value={role.responsibilities}
                          onChange={(e) =>
                            updateRole(index, { responsibilities: e.target.value })
                          }
                          placeholder="Responsibilities (one per line or paragraph)"
                          rows={2}
                          className="resize-none"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRole(index)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addRole}
              >
                Add role
              </Button>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Save */}
      <FadeIn delay={0.15}>
        <div className="flex items-center gap-3 pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save monitoring plan"}
          </Button>
          {saveStatus === "success" && (
            <span className="text-sm text-green-600">{saveMessage}</span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-destructive">{saveMessage}</span>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
