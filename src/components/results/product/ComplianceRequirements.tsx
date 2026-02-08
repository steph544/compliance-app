"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";

interface ComplianceRequirement {
  regulation: string;
  requirements: string[];
  applicability: string;
}

interface ComplianceRequirementsProps {
  complianceRequirements: ComplianceRequirement[];
}

export function ComplianceRequirements({
  complianceRequirements,
}: ComplianceRequirementsProps) {
  return (
    <StaggeredList className="grid gap-4">
      {(complianceRequirements ?? []).map((item, i) => (
        <StaggeredItem key={i}>
          <Card className="transition-card hover-lift">
            <CardHeader>
              <CardTitle className="text-base">{item.regulation}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {item.applicability}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(item.requirements ?? []).map((req, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-muted-foreground/30">
                      <span className="sr-only">Checklist item</span>
                    </span>
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </StaggeredItem>
      ))}
    </StaggeredList>
  );
}
