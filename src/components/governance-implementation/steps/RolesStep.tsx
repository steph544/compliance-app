"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import { step2Schema } from "@/lib/governance-implementation/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTrackingFields } from "./SectionTrackingFields";
import type { z } from "zod";

type Step2Data = z.infer<typeof step2Schema>;

interface RolesStepProps {
  blueprint: {
    roles: Array<{
      title: string;
      description: string;
      line: number;
    }>;
  };
}

export function RolesStep({ blueprint }: RolesStepProps) {
  const { sections, setSectionData } = useImplementationStore();
  const section = sections[1]; // roles is index 1

  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      tracking: {
        status: section?.status ?? "NOT_STARTED",
        dueDate: section?.dueDate ?? null,
        owner: section?.owner ?? "",
        notes: section?.notes ?? "",
      },
      assignments: (blueprint.roles ?? []).map((r) => ({
        title: r.title,
        assignedPerson:
          ((section?.data as Record<string, unknown>)?.assignments as Array<{ title: string; assignedPerson: string }> | undefined)?.find(
            (a) => a.title === r.title
          )?.assignedPerson ?? "",
      })),
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values) return;
      setSectionData(1, {
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
              Recommended Governance Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(blueprint.roles ?? []).map((role) => (
                <div key={role.title} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0 mt-0.5">
                    LoD {role.line}
                  </Badge>
                  <div>
                    <p className="font-medium">{role.title}</p>
                    <p className="text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Assign People to Each Role</h3>
          {(blueprint.roles ?? []).map((role, index) => (
            <div
              key={role.title}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{role.title}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {role.description}
                </p>
                <FormField
                  control={form.control}
                  name={`assignments.${index}.assignedPerson`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter person's name"
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
