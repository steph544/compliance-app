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

export default function Step7VendorInfra() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step7 as Step7Data) || {};

  const form = useForm<Step7Data>({
    resolver: zodResolver(step7Schema) as any,
    defaultValues: {
      providers: existingAnswers.providers ?? [],
      deployment: existingAnswers.deployment ?? "cloud",
      thirdPartyComponents: existingAnswers.thirdPartyComponents ?? false,
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
        <FormField
          control={form.control}
          name="providers"
          render={() => (
            <FormItem>
              <FormLabel>AI Providers & Platforms</FormLabel>
              <p className="text-sm text-muted-foreground">
                Select all AI providers and platforms your organization uses or plans to
                use.
              </p>
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

        <FormField
          control={form.control}
          name="deployment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deployment Model</FormLabel>
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
          name="thirdPartyComponents"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Third-Party Components</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Does your AI stack include third-party components or libraries?
                </p>
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
