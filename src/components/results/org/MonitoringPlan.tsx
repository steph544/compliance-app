"use client";

import { useState, useCallback, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, ChevronRightIcon, Sparkles } from "lucide-react";
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
  High: "border-l-red-500 bg-red-50/30",
  Medium: "border-l-slate-500 bg-slate-50/30",
  Low: "border-l-green-500 bg-green-50/30",
  Warning: "border-l-slate-500 bg-slate-50/30",
  Info: "border-l-blue-500 bg-blue-50/30",
};

/** Left border + subtle bg for Incident Triage table rows by severity. */
const severityRowColors: Record<string, string> = {
  Critical: "border-l-4 border-l-slate-600 bg-slate-50/20",
  High: "border-l-4 border-l-red-500 bg-red-50/20",
  Medium: "border-l-4 border-l-slate-500 bg-slate-50/20",
  Low: "border-l-4 border-l-green-500 bg-green-50/20",
  Warning: "border-l-4 border-l-slate-500 bg-slate-50/20",
  Info: "border-l-4 border-l-blue-500 bg-blue-50/20",
};

const severityBadge: Record<string, string> = {
  Critical: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  High: "bg-red-100 text-red-800",
  Medium: "bg-slate-100 text-slate-800",
  Low: "bg-green-100 text-green-800",
  Warning: "bg-slate-100 text-slate-800",
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

type RecommendationSection = "overview" | "metrics" | "cadence" | "runbook";

function getRecommendationSection(text: string): RecommendationSection {
  const t = text.toLowerCase();
  if (
    /pagerduty|opsgenie|escalation|incident (response|runbook|triage)|runbook|triage|response time|alerting system|escalation protocol/.test(t)
  ) {
    return "runbook";
  }
  if (
    /cadence|governance review|board reporting|alerting summary|weekly governance|monthly board/.test(t) &&
    !/pagerduty|opsgenie|incident runbook|escalation/.test(t)
  ) {
    return "cadence";
  }
  if (
    /metric|monitoring|data drift|bias metric|accuracy|performance|data privacy|access metric|logging and monitoring|access logs/.test(t) &&
    !/cadence|governance review|alert|runbook|escalation|incident response/.test(t)
  ) {
    return "metrics";
  }
  return "overview";
}

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
  const [activeTab, setActiveTab] = useState("overview");
  const [addedRecommendationKeys, setAddedRecommendationKeys] = useState<Set<string>>(
    () => new Set()
  );

  const tabCounts = useMemo(() => {
    const overviewDone =
      (plan.recommendationBullets?.length ?? 0) > 0 ||
      riskTier != null ||
      requiredControlsCount != null
        ? 1
        : 0;
    const overviewTotal = 1;
    const metricsTotal = plan.metrics?.length ?? 0;
    const metricsDone = (plan.metrics ?? []).filter(
      (m) => (m.name ?? "").trim() !== ""
    ).length;
    const cadenceTotal = 2;
    const cadenceDone = [plan.cadence?.trim(), plan.alertsSummary?.trim()].filter(
      Boolean
    ).length;
    const runbookTotal = 4;
    const runbookDone = [
      runbook.alerts,
      runbook.incidentTriage,
      runbook.escalationTriggers,
      runbook.roles,
    ].filter((arr) => (arr?.length ?? 0) >= 1).length;
    return {
      overviewDone,
      overviewTotal,
      metricsDone,
      metricsTotal,
      cadenceDone,
      cadenceTotal,
      runbookDone,
      runbookTotal,
    };
  }, [plan, runbook, riskTier, requiredControlsCount]);

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

  const addRecommendationToCadence = useCallback((bulletText: string) => {
    setPlan((p) => ({
      ...p,
      cadence: [p.cadence?.trim(), bulletText.trim()].filter(Boolean).join("\n\n"),
    }));
  }, []);

  const addRecommendationToRunbook = useCallback(
    (bulletText: string) => {
      const name =
        bulletText.length <= 40 ? bulletText : bulletText.slice(0, 37).trim() + "...";
      updateRunbook({
        alerts: [
          ...runbook.alerts,
          {
            name: name || "From recommendation",
            condition: bulletText,
            severity: "Warning",
            action: "slack-alerts",
          },
        ],
      });
    },
    [runbook.alerts, updateRunbook]
  );

  const addRecommendationToSection = useCallback(
    (bulletText: string, section: RecommendationSection) => {
      const key = bulletText.slice(0, 300);
      setAddedRecommendationKeys((prev) => new Set(prev).add(key));
      if (section === "overview" || section === "metrics") {
        addRecommendationAsMetric(bulletText);
      } else if (section === "cadence") {
        addRecommendationToCadence(bulletText);
      } else if (section === "runbook") {
        addRecommendationToRunbook(bulletText);
      }
    },
    [addRecommendationAsMetric, addRecommendationToCadence, addRecommendationToRunbook]
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

  const bulletsForCurrentTab = useMemo(() => {
    const bullets = plan.recommendationBullets ?? [];
    const section = activeTab as RecommendationSection;
    return bullets
      .map((bullet) => {
        const text = typeof bullet === "string" ? bullet : bullet.text;
        return { text, section: getRecommendationSection(text), bullet };
      })
      .filter(
        (item) =>
          item.section === section && !addedRecommendationKeys.has(item.text.slice(0, 300))
      );
  }, [
    plan.recommendationBullets,
    activeTab,
    addedRecommendationKeys,
  ]);

  const addToPlanTooltip: Record<RecommendationSection, string> = {
    overview: "Add to Monitoring Metrics",
    metrics: "Add to Metrics",
    cadence: "Add to Cadence & alerting",
    runbook: "Add to Runbook",
  };

  const recommendationBoxContent = () => {
    if (activeTab === "overview") {
      if (riskTier || requiredControlsCount != null) {
        return (
          <div className="space-y-2 text-xs text-muted-foreground">
            {riskTier && (
              <p>
                Your risk tier is <strong className="text-foreground">{riskTier}</strong>, so we
                recommend the monitoring cadence and response timelines below. You can adjust them
                to fit your team.
              </p>
            )}
            {requiredControlsCount != null && requiredControlsCount > 10 && (
              <p>
                With <strong className="text-foreground">{requiredControlsCount} required
                controls</strong>, we suggest using PagerDuty or OpsGenie for critical AI alerts
                (or update the Alerting summary in the Cadence & alerting tab).
              </p>
            )}
            {bulletsForCurrentTab.length > 0 && (
              <TooltipProvider>
                <ul className="list-disc list-inside space-y-1.5 mt-2">
                  {bulletsForCurrentTab.map(({ text, bullet }, i) => {
                    const isAiGenerated =
                      typeof bullet === "object" && "aiGenerated" in bullet && bullet.aiGenerated;
                    const section = getRecommendationSection(text);
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
                        {isAiGenerated && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                className="shrink-0 rounded-full shadow-sm"
                                onClick={() => addRecommendationToSection(text, section)}
                              >
                                Add to plan
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{addToPlanTooltip[section]}</TooltipContent>
                          </Tooltip>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </TooltipProvider>
            )}
          </div>
        );
      }
      if (bulletsForCurrentTab.length > 0) {
        return (
          <TooltipProvider>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-muted-foreground">
              {bulletsForCurrentTab.map(({ text, bullet }, i) => {
                const isAiGenerated =
                  typeof bullet === "object" && "aiGenerated" in bullet && bullet.aiGenerated;
                const section = getRecommendationSection(text);
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
                    {isAiGenerated && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="shrink-0 rounded-full shadow-sm"
                            onClick={() => addRecommendationToSection(text, section)}
                          >
                            Add to plan
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{addToPlanTooltip[section]}</TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        );
      }
      return (
        <p className="text-xs text-muted-foreground">
          Complete your assessment and recompute to see recommendations here.
        </p>
      );
    }
    if (bulletsForCurrentTab.length > 0) {
      const section = activeTab as RecommendationSection;
      return (
        <TooltipProvider>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-muted-foreground">
            {bulletsForCurrentTab.map(({ text, bullet }, i) => {
              const isAiGenerated =
                typeof bullet === "object" && "aiGenerated" in bullet && bullet.aiGenerated;
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
                  {isAiGenerated && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="shrink-0 rounded-full shadow-sm"
                          onClick={() => addRecommendationToSection(text, section)}
                        >
                          Add to plan
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{addToPlanTooltip[section]}</TooltipContent>
                    </Tooltip>
                  )}
                </li>
              );
            })}
          </ul>
        </TooltipProvider>
      );
    }
    if (activeTab === "metrics") {
      return (
        <p className="text-xs text-muted-foreground">
          Add metrics your team will track regularly; include target and frequency for each.
        </p>
      );
    }
    if (activeTab === "cadence") {
      return (
        <p className="text-xs text-muted-foreground">
          Set how often the governance team will review monitoring and metrics; define your
          alerting approach.
        </p>
      );
    }
    if (activeTab === "runbook") {
      return (
        <p className="text-xs text-muted-foreground">
          Define alerts, incident triage, escalation triggers, and roles for your operations
          runbook.
        </p>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap w-full h-auto gap-1">
          <TabsTrigger value="overview">
            Overview ({tabCounts.overviewDone}/{tabCounts.overviewTotal})
          </TabsTrigger>
          <TabsTrigger value="metrics">
            Metrics ({tabCounts.metricsDone}/{tabCounts.metricsTotal})
          </TabsTrigger>
          <TabsTrigger value="cadence">
            Cadence & alerting ({tabCounts.cadenceDone}/{tabCounts.cadenceTotal})
          </TabsTrigger>
          <TabsTrigger value="runbook">
            Runbook ({tabCounts.runbookDone}/{tabCounts.runbookTotal})
          </TabsTrigger>
        </TabsList>

        {/* Recommendation box (below tab bar, styled like Technical control recommendations) */}
        <section className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4 mt-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Recommendations for this section
              </h3>
            </div>
            <div className="mt-2">{recommendationBoxContent()}</div>
          </div>
        </section>

        {/* Save */}
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

        <TabsContent value="overview" className="mt-6 space-y-4">
          <FadeIn>
            <section>
              <h3 className="text-lg font-semibold mb-2">Based on your assessment</h3>
              {riskTier || requiredControlsCount != null ? (
                <div className="text-sm text-muted-foreground space-y-1">
                  {riskTier && (
                    <p>
                      Your risk tier is <strong>{riskTier}</strong>, so we recommend the
                      monitoring cadence and response timelines below. You can adjust them to fit
                      your team.
                    </p>
                  )}
                  {requiredControlsCount != null && requiredControlsCount > 10 && (
                    <p>
                      With <strong>{requiredControlsCount} required controls</strong>, we suggest
                      using PagerDuty or OpsGenie for critical AI alerts (or update the Alerting
                      summary in the Cadence & alerting tab).
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Recompute your assessment to see risk tier and control recommendations here.
                </p>
              )}
            </section>
          </FadeIn>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
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
        </TabsContent>

        <TabsContent value="cadence" className="mt-6">
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
        </TabsContent>

        <TabsContent value="runbook" className="mt-6">
      <FadeIn delay={0.1}>
        <section>
          <h3 className="text-lg font-semibold mb-4">Operations Runbook</h3>

          <div className="space-y-4">
            {/* Alerts */}
            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-2 text-left hover:bg-muted/50">
                <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                <h4 className="text-base font-medium">Alerts</h4>
                <span className="text-sm text-muted-foreground">
                  ({(runbook.alerts ?? []).length})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded-lg border border-border bg-muted/30 p-4 mt-2">
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
                    variant="default"
                    size="sm"
                    className="mt-2"
                    onClick={addAlert}
                  >
                    Add alert
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Incident Triage */}
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-2 text-left hover:bg-muted/50">
                <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                <h4 className="text-base font-medium">Incident Triage</h4>
                <span className="text-sm text-muted-foreground">
                  ({(runbook.incidentTriage ?? []).length})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-2">
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
                        <TableRow
                          key={index}
                          className={severityRowColors[triage.severity] ?? ""}
                        >
                          <TableCell>
                            <Input
                              value={triage.severity}
                              onChange={(e) =>
                                updateTriage(index, { severity: e.target.value })
                              }
                              placeholder="High"
                              className="w-28 min-w-0"
                            />
                          </TableCell>
                          <TableCell className="min-w-[180px]">
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
                              className="w-28 min-w-0"
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
                              className="h-7 w-7 p-0"
                              onClick={() => removeTriage(index)}
                            >
                              ×
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="mt-2"
                    onClick={addTriage}
                  >
                    Add row
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Escalation Triggers */}
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-2 text-left hover:bg-muted/50">
                <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                <h4 className="text-base font-medium">Escalation Triggers</h4>
                <span className="text-sm text-muted-foreground">
                  ({(runbook.escalationTriggers ?? []).length})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded-lg border border-border bg-muted/30 p-4 mt-2">
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
                          <TableCell className="min-w-[180px]">
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
                              className="w-28 min-w-0"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => removeEscalation(index)}
                            >
                              ×
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="mt-2"
                    onClick={addEscalation}
                  >
                    Add row
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Roles */}
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-2 text-left hover:bg-muted/50">
                <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-90" />
                <h4 className="text-base font-medium">Roles</h4>
                <span className="text-sm text-muted-foreground">
                  ({(runbook.roles ?? []).length})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded-lg border border-border bg-muted/30 p-4 mt-2">
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
                          <TableCell className="font-medium min-w-[140px]">
                            <Input
                              value={role.role}
                              onChange={(e) =>
                                updateRole(index, { role: e.target.value })
                              }
                              placeholder="Role name"
                            />
                          </TableCell>
                          <TableCell className="min-w-[220px]">
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
                              className="h-7 w-7 p-0"
                              onClick={() => removeRole(index)}
                            >
                              ×
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="mt-2"
                    onClick={addRole}
                  >
                    Add role
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>
      </FadeIn>
        </TabsContent>
      </Tabs>
    </div>
  );
}
