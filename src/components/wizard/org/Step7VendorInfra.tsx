"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { step7Schema, type Step7Data } from "@/lib/wizard/org-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PROVIDERS = [
  { value: "openai", label: "OpenAI/GPT" },
  { value: "bedrock", label: "AWS Bedrock" },
  { value: "azure", label: "Azure AI" },
  { value: "anthropic", label: "Anthropic/Claude" },
  { value: "google", label: "Google AI/Vertex" },
  { value: "huggingface", label: "Hugging Face" },
  { value: "other", label: "Other/Custom" },
] as const;

const DEPLOYMENT_OPTIONS = [
  { value: "on-prem", label: "On-Premises" },
  { value: "cloud", label: "Cloud" },
  { value: "hybrid", label: "Hybrid" },
] as const;

const INFRASTRUCTURE_OPTIONS = [
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "Google Cloud (GCP)" },
  { value: "multi", label: "Multi-cloud" },
  { value: "on_prem_only", label: "On-premises only" },
  { value: "hybrid", label: "Hybrid (e.g. cloud + on-prem)" },
] as const;

export default function Step7VendorInfra() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step7 as Step7Data) || {};

  const form = useForm<Step7Data>({
    resolver: zodResolver(step7Schema) as any,
    defaultValues: {
      providers: existingAnswers.providers ?? [],
      deployment: existingAnswers.deployment ?? "cloud",
      thirdPartyComponents: existingAnswers.thirdPartyComponents ?? false,
      primaryCloudInfrastructure: existingAnswers.primaryCloudInfrastructure ?? undefined,
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(7, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Vendor and infrastructure choices inform cloud-specific controls and implementation guidance.
        </p>
        <section className="w-full min-w-0 space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold text-foreground border-l-2 border-accent-primary pl-2">
            AI Providers & Infrastructure
          </h3>
        <FormField
          control={form.control}
          name="providers"
          render={() => (
            <FormItem>
              <FormLabel>AI Providers & Platforms</FormLabel>
              <FormDescription>
                Select all AI providers and platforms your organization uses or plans to
                use. Used to tailor control recommendations and vendor guidance.
              </FormDescription>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {PROVIDERS.map((provider) => (
                  <FormField
                    key={provider.value}
                    control={form.control}
                    name="providers"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(provider.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              if (checked) {
                                field.onChange([...current, provider.value]);
                              } else {
                                field.onChange(
                                  current.filter(
                                    (v: string) => v !== provider.value
                                  )
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <Label className="font-normal">{provider.label}</Label>
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
        <FormField
          control={form.control}
          name="deployment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deployment Model</FormLabel>
              <FormDescription>
                Informs infrastructure-related controls and deployment guidance.
              </FormDescription>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3 mt-2"
                >
                  {DEPLOYMENT_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`deployment-${option.value}`}
                      />
                      <Label htmlFor={`deployment-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryCloudInfrastructure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary deployment infrastructure</FormLabel>
              <FormDescription>
                Where do you host AI workloads? We use this to recommend cloud-specific
                controls (e.g. AWS Bedrock Guardrails, Azure AI Content Safety).
              </FormDescription>
              <FormControl>
                <RadioGroup
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || undefined)}
                  className="grid gap-3 mt-2"
                >
                  {INFRASTRUCTURE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`infra-${option.value}`}
                      />
                      <Label htmlFor={`infra-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thirdPartyComponents"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Third-Party Components</FormLabel>
                <FormDescription>
                  Does your AI stack include third-party components or libraries? Informs supply-chain and security control recommendations.
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
      </form>
    </Form>
  );
}
