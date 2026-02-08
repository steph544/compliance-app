"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep3Schema } from "@/lib/wizard/product-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Step3Data = z.infer<typeof productStep3Schema>;

const AI_TYPES = [
  { value: "generative", label: "Generative AI" },
  { value: "classification", label: "Classification" },
  { value: "recommendation", label: "Recommendation" },
  { value: "nlp", label: "Natural Language Processing (NLP)" },
  { value: "vision", label: "Computer Vision" },
  { value: "other", label: "Other" },
] as const;

const MODEL_SOURCES = [
  { value: "build", label: "Build from scratch" },
  { value: "buy", label: "Buy a commercial model" },
  { value: "fine-tune", label: "Fine-tune an existing model" },
  { value: "api", label: "Use via API" },
] as const;

const TRAINING_DATA_SOURCES = [
  { value: "internal", label: "Internal data" },
  { value: "public", label: "Public datasets" },
  { value: "licensed", label: "Licensed data" },
  { value: "synthetic", label: "Synthetic data" },
] as const;

export default function Step3AISystemDetails() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step3 as Step3Data) || {};

  const form = useForm<Step3Data>({
    resolver: zodResolver(productStep3Schema) as any,
    defaultValues: {
      aiType: existingAnswers.aiType ?? [],
      modelSource: existingAnswers.modelSource ?? "api",
      specificModels: existingAnswers.specificModels ?? [],
      trainingDataSource: existingAnswers.trainingDataSource ?? [],
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
        <FormField
          control={form.control}
          name="aiType"
          render={() => (
            <FormItem>
              <FormLabel>AI Type</FormLabel>
              <p className="text-sm text-muted-foreground">
                Select all AI types that apply to this project.
              </p>
              <div className="grid gap-4 mt-2">
                {AI_TYPES.map((type) => (
                  <FormField
                    key={type.value}
                    control={form.control}
                    name="aiType"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(type.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              if (checked) {
                                field.onChange([...current, type.value]);
                              } else {
                                field.onChange(
                                  current.filter((v: string) => v !== type.value)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <Label className="font-normal">{type.label}</Label>
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
          name="modelSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Source</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {MODEL_SOURCES.map((source) => (
                    <div key={source.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={source.value}
                        id={`modelSource-${source.value}`}
                      />
                      <Label htmlFor={`modelSource-${source.value}`}>
                        {source.label}
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
          name="specificModels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specific Models (comma-separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. GPT-4, Claude, Llama 2"
                  value={(field.value ?? []).join(", ")}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(
                      val
                        ? val.split(",").map((s) => s.trim()).filter(Boolean)
                        : []
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trainingDataSource"
          render={() => (
            <FormItem>
              <FormLabel>Training Data Source</FormLabel>
              <p className="text-sm text-muted-foreground">
                Select all training data sources that apply.
              </p>
              <div className="grid gap-4 mt-2">
                {TRAINING_DATA_SOURCES.map((source) => (
                  <FormField
                    key={source.value}
                    control={form.control}
                    name="trainingDataSource"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(source.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              if (checked) {
                                field.onChange([...current, source.value]);
                              } else {
                                field.onChange(
                                  current.filter((v: string) => v !== source.value)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <Label className="font-normal">{source.label}</Label>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
