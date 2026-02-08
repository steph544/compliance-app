"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep10Schema } from "@/lib/wizard/product-schema";
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

type Step10Data = z.infer<typeof productStep10Schema>;

const COMPLIANCE_FIELDS = [
  {
    name: "regulatoryRequirementsIdentified" as const,
    label: "Regulatory requirements identified",
    description:
      "All applicable regulatory requirements (e.g., EU AI Act, GDPR, sector-specific) have been identified and documented",
  },
  {
    name: "legalReviewCompleted" as const,
    label: "Legal review completed",
    description:
      "Legal counsel has reviewed the AI system for compliance with applicable laws and regulations",
  },
  {
    name: "ethicsReviewCompleted" as const,
    label: "Ethics review completed",
    description:
      "An ethics review has been conducted to evaluate potential harms, fairness, and responsible AI considerations",
  },
  {
    name: "stakeholderSignOff" as const,
    label: "Stakeholder sign-off obtained",
    description:
      "Key stakeholders (business owners, legal, compliance, engineering) have formally approved the project",
  },
  {
    name: "goLiveCriteriaDefined" as const,
    label: "Go-live criteria defined",
    description:
      "Clear criteria for production deployment have been defined, including performance thresholds and safety checks",
  },
] as const;

export default function Step10ComplianceApproval() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step10 as Step10Data) || {};

  const form = useForm<Step10Data>({
    resolver: zodResolver(productStep10Schema) as any,
    defaultValues: {
      regulatoryRequirementsIdentified:
        existingAnswers.regulatoryRequirementsIdentified ?? false,
      legalReviewCompleted:
        existingAnswers.legalReviewCompleted ?? false,
      ethicsReviewCompleted:
        existingAnswers.ethicsReviewCompleted ?? false,
      stakeholderSignOff: existingAnswers.stakeholderSignOff ?? false,
      goLiveCriteriaDefined:
        existingAnswers.goLiveCriteriaDefined ?? false,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(10, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Compliance and approval inform GOVERN 1.1, MANAGE 1.1, MANAGE 1.3 and sign-off tracking.
        </p>
        <section className="space-y-4">
          <SectionHeader
            title="Compliance & approval"
            description="Confirm which compliance and approval milestones have been completed for this AI project."
            accentBorder
          />
          <div className="grid gap-3">
            {COMPLIANCE_FIELDS.map((complianceField) => (
              <FormField
                key={complianceField.name}
                control={form.control}
                name={complianceField.name}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
                    <div className="space-y-0.5">
                      <FormLabel>{complianceField.label}</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        {complianceField.description}
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
