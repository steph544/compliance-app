"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { UseFormReturn } from "react-hook-form";

interface SectionTrackingFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export function SectionTrackingFields({ form }: SectionTrackingFieldsProps) {
  return (
    <div className="mt-8">
      <Separator className="mb-6" />
      <h4 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Section Tracking
      </h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="tracking.status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tracking.dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value || null)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tracking.owner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Owner</FormLabel>
              <FormControl>
                <Input
                  placeholder="Person responsible for this section"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tracking.notes"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Implementation Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes about implementation progress, blockers, or decisions..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
