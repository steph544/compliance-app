"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useImplementationStore } from "@/lib/governance-implementation/implementation-store";
import { step3Schema } from "@/lib/governance-implementation/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { SectionTrackingFields } from "./SectionTrackingFields";
import type { z } from "zod";

type Step3Data = z.infer<typeof step3Schema>;

interface CommitteesStepProps {
  blueprint: {
    committees: Array<{
      name: string;
      members: string[];
      cadence: string;
      charter: string;
    }>;
  };
}

export function CommitteesStep({ blueprint }: CommitteesStepProps) {
  const { sections, setSectionData } = useImplementationStore();
  const section = sections[2]; // committees is index 2
  const savedCommittees = (section?.data as Record<string, unknown>)?.committees as Array<{
    name: string;
    confirmedMembers: string[];
    meetingSchedule: string;
    firstMeetingDate: string | null;
    charterConfirmed: boolean;
  }> | undefined;

  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      tracking: {
        status: section?.status ?? "NOT_STARTED",
        dueDate: section?.dueDate ?? null,
        owner: section?.owner ?? "",
        notes: section?.notes ?? "",
      },
      committees: (blueprint.committees ?? []).map((c) => {
        const saved = savedCommittees?.find((sc) => sc.name === c.name);
        return {
          name: c.name,
          confirmedMembers: saved?.confirmedMembers ?? [],
          meetingSchedule: saved?.meetingSchedule ?? c.cadence ?? "",
          firstMeetingDate: saved?.firstMeetingDate ?? null,
          charterConfirmed: saved?.charterConfirmed ?? false,
        };
      }),
    },
  });

  // Track new member input per committee
  const [newMemberInputs, setNewMemberInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values) return;
      setSectionData(2, {
        status: values.tracking?.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" ?? "NOT_STARTED",
        dueDate: values.tracking?.dueDate ?? null,
        owner: values.tracking?.owner ?? "",
        notes: values.tracking?.notes ?? "",
        data: { committees: values.committees },
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setSectionData]);

  const addMember = (committeeIndex: number) => {
    const name = newMemberInputs[committeeIndex]?.trim();
    if (!name) return;
    const current = form.getValues(`committees.${committeeIndex}.confirmedMembers`) ?? [];
    form.setValue(`committees.${committeeIndex}.confirmedMembers`, [...current, name]);
    setNewMemberInputs((prev) => ({ ...prev, [committeeIndex]: "" }));
  };

  const removeMember = (committeeIndex: number, memberIndex: number) => {
    const current = form.getValues(`committees.${committeeIndex}.confirmedMembers`) ?? [];
    form.setValue(
      `committees.${committeeIndex}.confirmedMembers`,
      current.filter((_, i) => i !== memberIndex)
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* AI Recommendation */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Recommended Committee Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(blueprint.committees ?? []).map((c) => (
                <div key={c.name} className="text-sm">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-muted-foreground">
                    Cadence: {c.cadence} | Members: {Array.isArray(c.members) ? c.members.join(", ") : c.members}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Charter: {c.charter}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Committee Forms */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Configure Committees</h3>
          {(blueprint.committees ?? []).map((committee, index) => (
            <Card key={committee.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{committee.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`committees.${index}.meetingSchedule`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Schedule</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Every 2nd Tuesday"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`committees.${index}.firstMeetingDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Meeting Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Members list */}
                <div>
                  <FormLabel>Committee Members</FormLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(form.watch(`committees.${index}.confirmedMembers`) ?? []).map(
                      (member: string, mi: number) => (
                        <Badge
                          key={mi}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {member}
                          <button
                            type="button"
                            onClick={() => removeMember(index, mi)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Add member name"
                      value={newMemberInputs[index] ?? ""}
                      onChange={(e) =>
                        setNewMemberInputs((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMember(index);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addMember(index)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name={`committees.${index}.charterConfirmed`}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel className="text-sm">
                          Charter Confirmed
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Mark when the committee charter has been reviewed and
                          approved
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
