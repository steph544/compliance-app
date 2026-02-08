"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step3Schema, type Step3Data } from "@/lib/wizard/org-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { SelectableOptionTiles } from "@/components/wizard/SelectableOptionTiles";

const MATURITY_OPTIONS = [
  {
    value: "none",
    label: "No AI in Use",
    description: "No AI in use",
  },
  {
    value: "pilots",
    label: "Pilots / Experiments",
    description: "Running AI pilots/experiments",
  },
  {
    value: "production",
    label: "Production",
    description: "AI systems in production",
  },
  {
    value: "enterprise",
    label: "Enterprise-wide",
    description: "Enterprise-wide AI deployment",
  },
] as const;

export default function Step3AIMaturity() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step3 as Step3Data) || {};

  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      maturityStage: existingAnswers.maturityStage ?? "none",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(3, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Your AI maturity stage influences governance recommendations and readiness scoring.
        </p>
        <section className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
            AI Maturity Stage
          </h3>
        <FormField
          control={form.control}
          name="maturityStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Maturity Stage</FormLabel>
              <FormDescription>
                Select the stage that best describes your organization&apos;s current AI
                adoption level. Used to tailor governance and control recommendations.
              </FormDescription>
              <FormControl>
                <SelectableOptionTiles
                  options={MATURITY_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                    description: o.description,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  gridCols="2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </section>
      </form>
    </Form>
  );
}
