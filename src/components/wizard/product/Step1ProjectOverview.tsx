"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { useWizardStore } from "@/lib/wizard/wizard-store";
import { productStep1Schema } from "@/lib/wizard/product-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Step1Data = z.infer<typeof productStep1Schema>;

const PROJECT_STAGES = [
  { value: "ideation", label: "Ideation" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "testing", label: "Testing" },
  { value: "production", label: "Production" },
] as const;

export default function Step1ProjectOverview() {
  const { answers, setStepAnswers } = useWizardStore();
  const existingAnswers = (answers.step1 as Step1Data) || {};

  const form = useForm<Step1Data>({
    resolver: zodResolver(productStep1Schema),
    defaultValues: {
      projectName: existingAnswers.projectName ?? "",
      description: existingAnswers.description ?? "",
      businessObjective: existingAnswers.businessObjective ?? "",
      projectStage: existingAnswers.projectStage ?? "ideation",
      department: existingAnswers.department ?? "",
      projectOwner: existingAnswers.projectOwner ?? "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setStepAnswers(1, values as unknown as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepAnswers]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your AI project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this AI project does..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessObjective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Objective</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What business problem does this project solve?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Stage</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3"
                >
                  {PROJECT_STAGES.map((stage) => (
                    <div key={stage.value} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={stage.value}
                        id={`projectStage-${stage.value}`}
                      />
                      <Label htmlFor={`projectStage-${stage.value}`}>
                        {stage.label}
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
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Engineering, Product, Marketing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectOwner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Owner</FormLabel>
              <FormControl>
                <Input placeholder="Name of the project owner" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
