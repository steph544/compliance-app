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
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="humanAIConfig"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Human-AI Configuration</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {HUMAN_AI_CONFIGS.map((config) => (
                    <div
                      key={config.value}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <RadioGroupItem
                        value={config.value}
                        id={`humanAIConfig-${config.value}`}
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor={`humanAIConfig-${config.value}`}>
                          {config.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
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

        <FormField
          control={form.control}
          name="operatorProficiency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operator Proficiency Requirements</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the skill level and training required for operators..."
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
              <FormLabel>Fallback Plan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what happens when the AI system is unavailable or fails..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modelSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Size</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {MODEL_SIZES.map((size) => (
                    <div key={size.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={size.value}
                        id={`modelSize-${size.value}`}
                      />
                      <Label htmlFor={`modelSize-${size.value}`}>
                        {size.label}
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
          name="inferenceVolume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inference Volume</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {INFERENCE_VOLUMES.map((volume) => (
                    <div key={volume.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={volume.value}
                        id={`inferenceVolume-${volume.value}`}
                      />
                      <Label htmlFor={`inferenceVolume-${volume.value}`}>
                        {volume.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
