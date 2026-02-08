"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep4Schema } from "@/lib/wizard/product-schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/wizard/SectionHeader";
import { cn } from "@/lib/utils";

type Step4Data = z.infer<typeof productStep4Schema>;

const END_USER_OPTIONS = [
  { value: "employees", label: "Internal employees" },
  { value: "customers", label: "Customers" },
  { value: "public", label: "General public" },
] as const;

const IMPACT_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

const POPULATION_SIZES = [
  { value: "small", label: "Small (< 1,000 people)" },
  { value: "medium", label: "Medium (1,000 - 100,000 people)" },
  { value: "large", label: "Large (100,000+ people)" },
] as const;

const UPSTREAM_STAKEHOLDERS = [
  { value: "data_providers", label: "Data providers" },
  { value: "model_vendors", label: "Model vendors" },
  { value: "cloud_providers", label: "Cloud providers" },
  { value: "regulators", label: "Regulators" },
  { value: "internal_teams", label: "Internal teams" },
] as const;

const DOWNSTREAM_STAKEHOLDERS = [
  { value: "end_users", label: "End users" },
  { value: "affected_communities", label: "Affected communities" },
  { value: "business_partners", label: "Business partners" },
  { value: "oversight_bodies", label: "Oversight bodies" },
  { value: "civil_society", label: "Civil society organizations" },
] as const;

const INCLUSION_CONCERNS = [
  { value: "disabilities", label: "People with disabilities" },
  { value: "language", label: "Language barriers" },
  { value: "bandwidth", label: "Limited bandwidth / connectivity" },
  { value: "devices", label: "Limited device access" },
] as const;

export default function Step4UseCaseImpact() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step4 as Step4Data) || {};

  const form = useForm<Step4Data>({
    resolver: zodResolver(productStep4Schema) as any,
    defaultValues: {
      endUsers: existingAnswers.endUsers ?? "employees",
      decisions: existingAnswers.decisions ?? "",
      canDenyServices: existingAnswers.canDenyServices ?? false,
      impactSeverity: existingAnswers.impactSeverity ?? "low",
      affectedPopulation: existingAnswers.affectedPopulation ?? "small",
      upstreamStakeholders: existingAnswers.upstreamStakeholders ?? [],
      downstreamStakeholders: existingAnswers.downstreamStakeholders ?? [],
      inclusionConcerns: existingAnswers.inclusionConcerns ?? [],
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(4, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  const checkboxCard =
    "flex items-center gap-3 rounded-lg border-2 border-border bg-muted/20 px-4 py-3 transition-colors";

  return (
    <Form {...form}>
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Use case and impact inform MAP 2.2, MAP 3.1–3.4, MAP 5.1 and risk scoring.
        </p>
        <section className="space-y-5">
          <SectionHeader
            title="End users & impact"
            description="Who uses this system and the severity of impact."
            accentBorder
          />
          <FormField
            control={form.control}
            name="endUsers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End users</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-2 sm:grid-cols-3"
                  >
                    {END_USER_OPTIONS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`endUsers-${option.value}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors hover:border-muted-foreground/40",
                          field.value === option.value ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        )}
                      >
                        <RadioGroupItem value={option.value} id={`endUsers-${option.value}`} />
                        <span className="font-medium text-foreground">{option.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="canDenyServices"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
                <div className="space-y-0.5">
                  <FormLabel>Can deny services to individuals?</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Can this AI system deny services, benefits, or opportunities to individuals?
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="impactSeverity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact severity</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                  >
                    {IMPACT_LEVELS.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`impactSeverity-${option.value}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors hover:border-muted-foreground/40",
                          field.value === option.value ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        )}
                      >
                        <RadioGroupItem value={option.value} id={`impactSeverity-${option.value}`} />
                        <span className="font-medium text-foreground">{option.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="affectedPopulation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Affected population size</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-2 sm:grid-cols-3"
                  >
                    {POPULATION_SIZES.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`affectedPopulation-${option.value}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors hover:border-muted-foreground/40",
                          field.value === option.value ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        )}
                      >
                        <RadioGroupItem value={option.value} id={`affectedPopulation-${option.value}`} />
                        <span className="font-medium text-foreground">{option.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-5">
          <SectionHeader
            title="Stakeholders"
            description="Upstream and downstream parties involved or affected."
          />
          <FormField
            control={form.control}
            name="upstreamStakeholders"
            render={() => (
              <FormItem>
                <FormLabel>Upstream stakeholders</FormLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {UPSTREAM_STAKEHOLDERS.map((stakeholder) => (
                    <FormField
                      key={stakeholder.value}
                      control={form.control}
                      name="upstreamStakeholders"
                      render={({ field }) => (
                        <FormItem className={cn(checkboxCard, field.value?.includes(stakeholder.value) && "border-primary bg-primary/5")}>
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(stakeholder.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value ?? [];
                                if (checked) field.onChange([...current, stakeholder.value]);
                                else field.onChange(current.filter((v: string) => v !== stakeholder.value));
                              }}
                            />
                          </FormControl>
                          <Label className="cursor-pointer font-normal">{stakeholder.label}</Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="downstreamStakeholders"
            render={() => (
              <FormItem>
                <FormLabel>Downstream stakeholders</FormLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DOWNSTREAM_STAKEHOLDERS.map((stakeholder) => (
                    <FormField
                      key={stakeholder.value}
                      control={form.control}
                      name="downstreamStakeholders"
                      render={({ field }) => (
                        <FormItem className={cn(checkboxCard, field.value?.includes(stakeholder.value) && "border-primary bg-primary/5")}>
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(stakeholder.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value ?? [];
                                if (checked) field.onChange([...current, stakeholder.value]);
                                else field.onChange(current.filter((v: string) => v !== stakeholder.value));
                              }}
                            />
                          </FormControl>
                          <Label className="cursor-pointer font-normal">{stakeholder.label}</Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-5">
          <SectionHeader
            title="Inclusion concerns"
            description="Select any inclusion concerns relevant to this project."
          />
          <FormField
            control={form.control}
            name="inclusionConcerns"
            render={() => (
              <FormItem>
                <div className="grid gap-2 sm:grid-cols-2">
                  {INCLUSION_CONCERNS.map((concern) => (
                    <FormField
                      key={concern.value}
                      control={form.control}
                      name="inclusionConcerns"
                      render={({ field }) => (
                        <FormItem className={cn(checkboxCard, field.value?.includes(concern.value) && "border-primary bg-primary/5")}>
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(concern.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value ?? [];
                                if (checked) field.onChange([...current, concern.value]);
                                else field.onChange(current.filter((v: string) => v !== concern.value));
                              }}
                            />
                          </FormControl>
                          <Label className="cursor-pointer font-normal">{concern.label}</Label>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>
      </form>
    </Form>
  );
}
