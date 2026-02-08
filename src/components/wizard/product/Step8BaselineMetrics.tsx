"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep8Schema } from "@/lib/wizard/product-schema";
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
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step8 as Step8Data) || {};

  const [metrics, setMetrics] = useState<BaselineMetric[]>(
    existingAnswers.baselineMetrics ?? []
  );
  const [constraints, setConstraints] = useState<RAIConstraint[]>(
    existingAnswers.raiConstraints ?? []
  );

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
        {/* Baseline Metrics */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Baseline Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Define the key performance metrics and success criteria for this
              AI project.
            </p>
          </div>

          <div className="grid gap-4">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 space-y-3"
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

          <Button type="button" variant="outline" onClick={addMetric}>
            + Add Metric
          </Button>
        </div>

        {/* RAI Constraints */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">
              Responsible AI Constraints
            </h3>
            <p className="text-sm text-muted-foreground">
              Define responsible AI constraints that must be met before
              deployment.
            </p>
          </div>

          <div className="grid gap-4">
            {constraints.map((constraint, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 space-y-3"
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

          <Button type="button" variant="outline" onClick={addConstraint}>
            + Add Constraint
          </Button>
        </div>

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
