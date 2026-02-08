"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep9Schema } from "@/lib/wizard/product-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { SectionHeader } from "@/components/wizard/SectionHeader";

type Step9Data = z.infer<typeof productStep9Schema>;

const CONTROL_FIELDS = [
  {
    name: "testingPlan" as const,
    label: "Testing plan",
    description:
      "A documented testing plan covering functional, performance, and safety testing for the AI system",
  },
  {
    name: "monitoring" as const,
    label: "Production monitoring",
    description:
      "Active monitoring of model performance, data drift, and system health in production",
  },
  {
    name: "documentation" as const,
    label: "Technical documentation",
    description:
      "Comprehensive documentation of the AI system including model cards, data sheets, and architecture diagrams",
  },
  {
    name: "accessControls" as const,
    label: "Access controls",
    description:
      "Role-based access controls restricting who can modify, deploy, or interact with the AI system",
  },
  {
    name: "humanReview" as const,
    label: "Human review process",
    description:
      "A defined process for human review of AI outputs, especially for high-stakes decisions",
  },
  {
    name: "incidentResponse" as const,
    label: "Incident response plan",
    description:
      "A documented plan for responding to AI-related incidents, failures, or harmful outputs",
  },
] as const;

export default function Step9ExistingControls() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step9 as Step9Data) || {};

  const form = useForm<Step9Data>({
    resolver: zodResolver(productStep9Schema) as any,
    defaultValues: {
      testingPlan: existingAnswers.testingPlan ?? false,
      monitoring: existingAnswers.monitoring ?? false,
      documentation: existingAnswers.documentation ?? false,
      accessControls: existingAnswers.accessControls ?? false,
      humanReview: existingAnswers.humanReview ?? false,
      incidentResponse: existingAnswers.incidentResponse ?? false,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(9, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Existing controls inform MEASURE 1.3, MANAGE 4.1, GOVERN 4.3 recommendations.
        </p>
        <section className="space-y-4">
          <SectionHeader
            title="Existing controls"
            description="Indicate which controls are currently in place for this AI project."
            accentBorder
          />
          <div className="grid gap-3">
            {CONTROL_FIELDS.map((controlField) => (
              <FormField
                key={controlField.name}
                control={form.control}
                name={controlField.name}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel>{controlField.label}</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        {controlField.description}
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </section>
      </form>
    </Form>
  );
}
