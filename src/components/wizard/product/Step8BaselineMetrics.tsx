"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep8Schema } from "@/lib/wizard/product-schema";
import {
  getBaselineSuggestions,
  type BaselineMetricSuggestion,
  type RAIConstraintSuggestion,
} from "@/lib/wizard/baseline-suggestions";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/wizard/SectionHeader";
import { Sparkles } from "lucide-react";

type Step8Data = z.infer<typeof productStep8Schema>;

interface BaselineMetric {
  name: string;
  currentValue: string;
  target: string;
  mustHave: boolean;
}

interface RAIConstraint {
  metric: string;
  threshold: string;
  owner: string;
}

export default function Step8BaselineMetrics() {
  const params = useParams<{ id: string; pid: string }>();
  const id = params?.id;
  const pid = params?.pid;
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step8 as Step8Data) || {};

  const [metrics, setMetrics] = useState<BaselineMetric[]>(
    existingAnswers.baselineMetrics ?? []
  );
  const [constraints, setConstraints] = useState<RAIConstraint[]>(
    existingAnswers.raiConstraints ?? []
  );
  const [aiSuggestions, setAiSuggestions] = useState<{
    suggestedMetrics: (BaselineMetricSuggestion & { aiGenerated?: boolean })[];
    suggestedConstraints: (RAIConstraintSuggestion & { aiGenerated?: boolean })[];
  } | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ruleBasedSuggestions = useMemo(() => {
    const { suggestedMetrics, suggestedConstraints } = getBaselineSuggestions(answers);
    return {
      suggestedMetrics: suggestedMetrics.map((m) => ({ ...m, aiGenerated: false })),
      suggestedConstraints: suggestedConstraints.map((c) => ({ ...c, aiGenerated: false })),
    };
  }, [answers]);

  const form = useForm<Step8Data>({
    resolver: zodResolver(productStep8Schema) as any,
    defaultValues: {
      baselineMetrics: existingAnswers.baselineMetrics ?? [],
      raiConstraints: existingAnswers.raiConstraints ?? [],
    },
  });

  useEffect(() => {
    form.setValue("baselineMetrics", metrics);
    form.setValue("raiConstraints", constraints);
  }, [metrics, constraints, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(8, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  useEffect(() => {
    if (!id || !pid) {
      setAiSuggestions(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setSuggestionsLoading(true);
      fetch(`/api/org-assessments/${id}/products/${pid}/baseline-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch suggestions");
          return res.json();
        })
        .then((data) => {
          const metrics = data.suggestedMetrics ?? [];
          const constraints = data.suggestedConstraints ?? [];
          setAiSuggestions({
            suggestedMetrics: metrics.filter((m: { aiGenerated?: boolean }) => m.aiGenerated === true),
            suggestedConstraints: constraints.filter((c: { aiGenerated?: boolean }) => c.aiGenerated === true),
          });
        })
        .catch(() => setAiSuggestions(null))
        .finally(() => setSuggestionsLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // Only refetch when steps 1–7 change (context for suggestions). Adding a metric/constraint only updates step 8.
  }, [id, pid, answers.step1, answers.step2, answers.step3, answers.step4, answers.step5, answers.step6, answers.step7]);

  const { suggestedMetrics, suggestedConstraints } = useMemo(() => ({
    suggestedMetrics: [
      ...ruleBasedSuggestions.suggestedMetrics,
      ...(aiSuggestions?.suggestedMetrics ?? []),
    ],
    suggestedConstraints: [
      ...ruleBasedSuggestions.suggestedConstraints,
      ...(aiSuggestions?.suggestedConstraints ?? []),
    ],
  }), [ruleBasedSuggestions, aiSuggestions]);

  const addedMetricNames = useMemo(() => new Set(metrics.map((m) => m.name)), [metrics]);
  const addedConstraintMetrics = useMemo(() => new Set(constraints.map((c) => c.metric)), [constraints]);
  const suggestedMetricsToShow = useMemo(
    () => suggestedMetrics.filter((m) => !addedMetricNames.has(m.name)),
    [suggestedMetrics, addedMetricNames]
  );
  const suggestedConstraintsToShow = useMemo(
    () => suggestedConstraints.filter((c) => !addedConstraintMetrics.has(c.metric)),
    [suggestedConstraints, addedConstraintMetrics]
  );

  const addSuggestedMetric = (m: { name: string; currentValue: string; target: string; mustHave: boolean }) => {
    setMetrics([...metrics, { name: m.name, currentValue: m.currentValue, target: m.target, mustHave: m.mustHave }]);
  };

  const addSuggestedConstraint = (c: { metric: string; threshold: string; owner: string }) => {
    setConstraints([...constraints, { metric: c.metric, threshold: c.threshold, owner: c.owner }]);
  };

  const addMetric = () => {
    setMetrics([
      ...metrics,
      { name: "", currentValue: "", target: "", mustHave: false },
    ]);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (
    index: number,
    field: keyof BaselineMetric,
    value: string | boolean
  ) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], [field]: value };
    setMetrics(updated);
  };

  const addConstraint = () => {
    setConstraints([
      ...constraints,
      { metric: "", threshold: "", owner: "" },
    ]);
  };

  const removeConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const updateConstraint = (
    index: number,
    field: keyof RAIConstraint,
    value: string
  ) => {
    const updated = [...constraints];
    updated[index] = { ...updated[index], [field]: value };
    setConstraints(updated);
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Baseline metrics and success criteria inform MAP 1.4, MAP 3.1, MANAGE 1.1, MEASURE 1.1.
        </p>
        {(suggestionsLoading || suggestedMetricsToShow.length > 0 || suggestedConstraintsToShow.length > 0) && (
        <section className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">AI suggestions</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on your project type, impact, and risks from earlier steps. Add any that apply — they will move below.
          </p>
          {suggestionsLoading ? (
            <p className="text-xs text-muted-foreground">Loading suggestions…</p>
          ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Suggested metrics</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedMetricsToShow.map((m, i) => (
                  <div key={`metric-${i}-${m.name}`} className="rounded-md border border-border bg-card px-3 py-2 text-sm">
                    <div className="font-medium text-foreground inline-flex items-center gap-1 flex-wrap">
                      {m.name}
                      {m.aiGenerated && (
                        <Badge
                          variant="secondary"
                          className="ml-2 text-[10px] font-normal px-1.5 py-0"
                        >
                          AI
                        </Badge>
                      )}
                    </div>
                    {m.reason && <div className="mt-0.5 text-xs text-muted-foreground">{m.reason}</div>}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Target: {m.target}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => addSuggestedMetric(m)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Suggested RAI constraints</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedConstraintsToShow.map((c, i) => (
                  <div key={`constraint-${i}-${c.metric}`} className="rounded-md border border-border bg-card px-3 py-2 text-sm">
                    <div className="font-medium text-foreground inline-flex items-center gap-1 flex-wrap">
                      {c.metric}
                      {c.aiGenerated && (
                        <Badge
                          variant="secondary"
                          className="ml-2 text-[10px] font-normal px-1.5 py-0"
                        >
                          AI
                        </Badge>
                      )}
                    </div>
                    {c.reason && <div className="mt-0.5 text-xs text-muted-foreground">{c.reason}</div>}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{c.threshold}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => addSuggestedConstraint(c)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
        </section>
        )}

        <section className="space-y-4">
          <SectionHeader
            title="Baseline metrics"
            description="Define the key performance metrics and success criteria for this AI project."
          />
          <div className="grid gap-4">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Metric {index + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMetric(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Name
                    </Label>
                    <Input
                      placeholder="e.g. Accuracy"
                      value={metric.name}
                      onChange={(e) =>
                        updateMetric(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Current Value
                    </Label>
                    <Input
                      placeholder="e.g. 85%"
                      value={metric.currentValue}
                      onChange={(e) =>
                        updateMetric(index, "currentValue", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Target
                    </Label>
                    <Input
                      placeholder="e.g. 95%"
                      value={metric.target}
                      onChange={(e) =>
                        updateMetric(index, "target", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={metric.mustHave}
                    onCheckedChange={(checked) =>
                      updateMetric(index, "mustHave", checked)
                    }
                  />
                  <Label className="text-sm font-normal">
                    Must-have (blocking release)
                  </Label>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addMetric}>
            + Add metric
          </Button>
        </section>

        <section className="space-y-4">
          <SectionHeader
            title="Responsible AI constraints"
            description="Define responsible AI constraints that must be met before deployment."
          />
          <div className="grid gap-4">
            {constraints.map((constraint, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Constraint {index + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConstraint(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Metric
                    </Label>
                    <Input
                      placeholder="e.g. Fairness score"
                      value={constraint.metric}
                      onChange={(e) =>
                        updateConstraint(index, "metric", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Threshold
                    </Label>
                    <Input
                      placeholder="e.g. >= 0.9"
                      value={constraint.threshold}
                      onChange={(e) =>
                        updateConstraint(index, "threshold", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Owner
                    </Label>
                    <Input
                      placeholder="e.g. ML Eng Team"
                      value={constraint.owner}
                      onChange={(e) =>
                        updateConstraint(index, "owner", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addConstraint}>
            + Add constraint
          </Button>
        </section>

        <FormField
          control={form.control}
          name="baselineMetrics"
          render={() => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="raiConstraints"
          render={() => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
