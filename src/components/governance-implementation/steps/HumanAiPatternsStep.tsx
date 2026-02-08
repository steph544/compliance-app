"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import { step6Schema } from "@/lib/governance-implementation/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTrackingFields } from "./SectionTrackingFields";
import type { z } from "zod";

type Step6Data = z.infer<typeof step6Schema>;

interface HumanAiPatternsStepProps {
  blueprint: {
    humanAiPatterns: Array<{
      pattern: string;
      description: string;
      whenToApply: string;
    }>;
  };
}

export function HumanAiPatternsStep({ blueprint }: HumanAiPatternsStepProps) {
  const { sections, setSectionData } = useImplementationStore();
  const section = sections[5]; // humanAiPatterns is index 5
  const savedPatterns = (section?.data as Record<string, unknown>)?.patterns as Array<{
    pattern: string;
    applicable: boolean;
    implementationNotes: string;
  }> | undefined;

  const form = useForm<Step6Data>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      tracking: {
        status: section?.status ?? "NOT_STARTED",
        dueDate: section?.dueDate ?? null,
        owner: section?.owner ?? "",
        notes: section?.notes ?? "",
      },
      patterns: (blueprint.humanAiPatterns ?? []).map((p) => {
        const saved = savedPatterns?.find((sp) => sp.pattern === p.pattern);
        return {
          pattern: p.pattern,
          applicable: saved?.applicable ?? true,
          implementationNotes: saved?.implementationNotes ?? "",
        };
      }),
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values) return;
      setSectionData(5, {
        status: values.tracking?.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" ?? "NOT_STARTED",
        dueDate: values.tracking?.dueDate ?? null,
        owner: values.tracking?.owner ?? "",
        notes: values.tracking?.notes ?? "",
        data: { patterns: values.patterns },
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setSectionData]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* AI Recommendation */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Recommended Human-AI Oversight Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(blueprint.humanAiPatterns ?? []).map((p) => (
                <div key={p.pattern} className="text-sm">
                  <p className="font-medium">{p.pattern}</p>
                  <p className="text-muted-foreground">{p.description}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    When to apply: {p.whenToApply}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pattern Forms */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Configure Oversight Patterns
          </h3>
          {(blueprint.humanAiPatterns ?? []).map((pattern, index) => (
            <Card key={pattern.pattern}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{pattern.pattern}</p>
                    <p className="text-sm text-muted-foreground">
                      {pattern.description}
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name={`patterns.${index}.applicable`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <Badge
                          variant={field.value ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {field.value ? "Applicable" : "Not Applicable"}
                        </Badge>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`patterns.${index}.implementationNotes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Implementation Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How will this pattern be implemented in your organization?"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <SectionTrackingFields form={form} />
      </form>
    </Form>
  );
}
