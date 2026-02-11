"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step9Schema, type Step9Data } from "@/lib/wizard/org-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const IMPACT_OPTIONS = [
  {
    value: "never",
    label: "Never",
    description: "No impact assessments are performed",
  },
  {
    value: "ad_hoc",
    label: "Ad Hoc",
    description: "Impact assessments are performed occasionally, as needed",
  },
  {
    value: "systematic",
    label: "Systematic",
    description: "Impact assessments are performed systematically for all AI projects",
  },
] as const;

const ENGAGEMENT_OPTIONS = [
  {
    value: "never",
    label: "Never",
    description: "No external stakeholder engagement on AI matters",
  },
  {
    value: "sometimes",
    label: "Sometimes",
    description: "Occasional engagement with external stakeholders",
  },
  {
    value: "regularly",
    label: "Regularly",
    description: "Regular, structured engagement with external stakeholders",
  },
] as const;

export default function Step9StakeholderEngagement() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step9 as Step9Data) || {};

  const form = useForm<Step9Data>({
    resolver: zodResolver(step9Schema) as any,
    defaultValues: {
      impactAssessments: existingAnswers.impactAssessments ?? "never",
      externalEngagement: existingAnswers.externalEngagement ?? "never",
      recourseMechanisms: existingAnswers.recourseMechanisms ?? false,
      publishedPrinciples: existingAnswers.publishedPrinciples ?? false,
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
          Stakeholder and impact practices align with NIST GOVERN 4.2, 5.1, 5.2 and inform governance recommendations.
        </p>
        <section className="w-full min-w-0 space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
            Impact & Stakeholder Practices
          </h3>
        <FormField
          control={form.control}
          name="impactAssessments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact Assessments</FormLabel>
              <FormDescription>
                How does your organization conduct AI impact assessments? Informs governance and control selection.
              </FormDescription>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-4 mt-2"
                >
                  {IMPACT_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`impact-${option.value}`}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor={`impact-${option.value}`}
                          className="font-medium"
                        >
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        </section>
        <FormField
          control={form.control}
          name="externalEngagement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External Stakeholder Engagement</FormLabel>
              <FormDescription>
                How often does your organization engage with external stakeholders on AI
                governance? Informs governance and transparency recommendations.
              </FormDescription>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-4 mt-2"
                >
                  {ENGAGEMENT_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`engagement-${option.value}`}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor={`engagement-${option.value}`}
                          className="font-medium"
                        >
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <section className="w-full min-w-0 space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2 mb-2">
            Recourse & Principles
          </h3>
        <FormField
          control={form.control}
          name="recourseMechanisms"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Recourse Mechanisms</FormLabel>
                <FormDescription>
                  Does your organization provide mechanisms for individuals to challenge
                  AI-driven decisions? Informs MANAGE and governance control selection.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publishedPrinciples"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Published AI Principles</FormLabel>
                <FormDescription>
                  Has your organization published AI ethics principles or guidelines? Informs policy and governance recommendations.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
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
