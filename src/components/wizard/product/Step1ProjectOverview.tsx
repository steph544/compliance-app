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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "@/components/wizard/SectionHeader";
import { SelectableOptionTiles } from "@/components/wizard/SelectableOptionTiles";

type Step1Data = z.infer<typeof productStep1Schema>;

const PROJECT_STAGES = [
  { value: "ideation", label: "Ideation", description: "Exploring ideas and use cases" },
  { value: "design", label: "Design", description: "Defining requirements and architecture" },
  { value: "development", label: "Development", description: "Building the AI system" },
  { value: "testing", label: "Testing", description: "Validation and QA" },
  { value: "production", label: "Production", description: "Live deployment" },
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
      <form className="space-y-8">
        <p className="text-sm text-muted-foreground">
          This step captures project context and aligns with MAP 1.1 and MAP 1.3 for governance and control tailoring.
        </p>
        {/* Project details */}
        <section className="space-y-5">
          <SectionHeader title="Project details" description="Core information about your AI project." accentBorder />
          <div className="grid gap-5 sm:grid-cols-1">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormDescription>Used in reports and product assessment results.</FormDescription>
                  <FormControl>
                    <Input placeholder="e.g. Customer support chatbot" {...field} />
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
                      placeholder="Describe what this AI project does and its main capabilities..."
                      className="min-h-[100px] resize-y"
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
                  <FormLabel>Business objective</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What business problem does this project solve?"
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Project stage */}
        <section className="space-y-4">
          <SectionHeader title="Project stage" description="Where this project is in its lifecycle." accentBorder />
          <FormField
            control={form.control}
            name="projectStage"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SelectableOptionTiles
                    options={PROJECT_STAGES.map((s) => ({
                      value: s.value,
                      label: s.label,
                      description: s.description,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    gridCols="4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* Team & ownership */}
        <section className="space-y-5">
          <SectionHeader title="Team & ownership" description="Department and responsible owner." />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Engineering, Product" {...field} />
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
                  <FormLabel>Project owner</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of the responsible owner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
      </form>
    </Form>
  );
}
