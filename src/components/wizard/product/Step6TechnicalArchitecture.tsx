"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep6Schema } from "@/lib/wizard/product-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/wizard/SectionHeader";
import { cn } from "@/lib/utils";

type Step6Data = z.infer<typeof productStep6Schema>;

const HUMAN_AI_CONFIGS = [
  {
    value: "in_the_loop",
    label: "Human-in-the-loop",
    description:
      "A human actively participates in every decision the AI makes. The AI cannot act without human approval.",
  },
  {
    value: "on_the_loop",
    label: "Human-on-the-loop",
    description:
      "The AI can act autonomously, but a human monitors and can intervene or override at any time.",
  },
  {
    value: "out_of_the_loop",
    label: "Human-out-of-the-loop",
    description:
      "The AI operates fully autonomously without real-time human oversight or intervention.",
  },
] as const;

const MODEL_SIZES = [
  { value: "small", label: "Small (< 1B parameters)" },
  { value: "medium", label: "Medium (1B - 100B parameters)" },
  { value: "large", label: "Large (100B+ parameters)" },
] as const;

const INFERENCE_VOLUMES = [
  { value: "low", label: "Low (< 1,000 requests/day)" },
  { value: "medium", label: "Medium (1,000 - 100,000 requests/day)" },
  { value: "high", label: "High (100,000+ requests/day)" },
] as const;

export default function Step6TechnicalArchitecture() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step6 as Step6Data) || {};

  const form = useForm<Step6Data>({
    resolver: zodResolver(productStep6Schema) as any,
    defaultValues: {
      inputTypes: existingAnswers.inputTypes ?? "",
      outputTypes: existingAnswers.outputTypes ?? "",
      integrationPoints: existingAnswers.integrationPoints ?? "",
      humanAIConfig: existingAnswers.humanAIConfig ?? "in_the_loop",
      operatorProficiency: existingAnswers.operatorProficiency ?? "",
      operatorOverrideAuthority:
        existingAnswers.operatorOverrideAuthority ?? true,
      fallback: existingAnswers.fallback ?? "",
      latencyRequirements: existingAnswers.latencyRequirements ?? "",
      logging: existingAnswers.logging ?? "",
      modelSize: existingAnswers.modelSize ?? "medium",
      inferenceVolume: existingAnswers.inferenceVolume ?? "medium",
      cloudRegion: existingAnswers.cloudRegion ?? "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(6, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Architecture and human-AI config inform MAP 3.4, MAP 3.5, GOVERN 3.2, MEASURE 2.10.
        </p>
        <section className="space-y-5">
          <SectionHeader
            title="Human–AI configuration"
            description="How humans interact with and oversee the AI system."
            accentBorder
          />
          <FormField
            control={form.control}
            name="humanAIConfig"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2">
                    {HUMAN_AI_CONFIGS.map((config) => (
                      <Label
                        key={config.value}
                        htmlFor={`humanAIConfig-${config.value}`}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border-2 px-4 py-3 transition-colors hover:border-muted-foreground/40",
                          field.value === config.value ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        )}
                      >
                        <RadioGroupItem value={config.value} id={`humanAIConfig-${config.value}`} className="mt-1" />
                        <div>
                          <span className="font-medium text-foreground">{config.label}</span>
                          <p className="mt-0.5 text-xs text-muted-foreground">{config.description}</p>
                        </div>
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
            name="operatorProficiency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operator proficiency requirements</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the skill level and training required for operators..."
                    className="min-h-[80px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fallback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fallback plan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what happens when the AI system is unavailable or fails..."
                    className="min-h-[80px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-5">
          <SectionHeader
            title="Scale & infrastructure"
            description="Model size and expected inference volume."
            accentBorder
          />
          <FormField
            control={form.control}
            name="modelSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model size</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2 sm:grid-cols-3">
                    {MODEL_SIZES.map((size) => (
                      <Label
                        key={size.value}
                        htmlFor={`modelSize-${size.value}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors hover:border-muted-foreground/40",
                          field.value === size.value ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        )}
                      >
                        <RadioGroupItem value={size.value} id={`modelSize-${size.value}`} />
                        <span className="font-medium text-foreground">{size.label}</span>
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
            name="inferenceVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inference volume</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-2 sm:grid-cols-3">
                    {INFERENCE_VOLUMES.map((volume) => (
                      <Label
                        key={volume.value}
                        htmlFor={`inferenceVolume-${volume.value}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors hover:border-muted-foreground/40",
                          field.value === volume.value ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                        )}
                      >
                        <RadioGroupItem value={volume.value} id={`inferenceVolume-${volume.value}`} />
                        <span className="font-medium text-foreground">{volume.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
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
