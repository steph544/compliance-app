"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import { step1Schema } from "@/lib/governance-implementation/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTrackingFields } from "./SectionTrackingFields";
import type { z } from "zod";

type Step1Data = z.infer<typeof step1Schema>;

interface ThreeLoDStepProps {
  blueprint: {
    threeLoD: Array<{
      line: number;
      role: string;
      description: string;
      assignedTo: string;
    }>;
  };
}

export function ThreeLoDStep({ blueprint }: ThreeLoDStepProps) {
  const { sections, setSectionData } = useImplementationStore();
  const section = sections[0]; // threeLoD is index 0

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      tracking: {
        status: section?.status ?? "NOT_STARTED",
        dueDate: section?.dueDate ?? null,
        owner: section?.owner ?? "",
        notes: section?.notes ?? "",
      },
      assignments: (blueprint.threeLoD ?? []).map((l) => ({
        line: l.line,
        assignedPerson:
          ((section?.data as Record<string, unknown>)?.assignments as Array<{ line: number; assignedPerson: string }> | undefined)?.find(
            (a) => a.line === l.line
          )?.assignedPerson ?? "",
      })),
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values) return;
      setSectionData(0, {
        status: values.tracking?.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" ?? "NOT_STARTED",
        dueDate: values.tracking?.dueDate ?? null,
        owner: values.tracking?.owner ?? "",
        notes: values.tracking?.notes ?? "",
        data: { assignments: values.assignments },
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
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(blueprint.threeLoD ?? []).map((lod) => (
                <div
                  key={lod.line}
                  className="flex items-start gap-3 text-sm"
                >
                  <Badge variant="outline" className="shrink-0 mt-0.5">
                    Line {lod.line}
                  </Badge>
                  <div>
                    <p className="font-medium">{lod.role}</p>
                    <p className="text-muted-foreground">{lod.description}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Suggested: {lod.assignedTo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Assign People to Each Line of Defense
          </h3>
          {(blueprint.threeLoD ?? []).map((lod, index) => (
            <div
              key={lod.line}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <Badge className="shrink-0">Line {lod.line}</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">{lod.role}</p>
                <FormField
                  control={form.control}
                  name={`assignments.${index}.assignedPerson`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={`e.g., ${lod.assignedTo}`}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <SectionTrackingFields form={form} />
      </form>
    </Form>
  );
}
