"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";
import { Check } from "lucide-react";

interface ComplianceRequirement {
  regulation: string;
  requirements: string[];
  applicability: string;
  triggerSummary?: string;
}

interface ComplianceRequirementsProps {
  complianceRequirements: ComplianceRequirement[];
}

const COMPLIANCE_SOURCE_COPY =
  "Based on: Organization jurisdictions (Org Step 2), Product use case and end users (Product Step 4), Data types (Product Step 5).";

export function ComplianceRequirements({
  complianceRequirements,
}: ComplianceRequirementsProps) {
  const items = complianceRequirements ?? [];

  return (
    <div className="space-y-6">
      <FadeIn>
        <ResultsSectionIntro
          description="These regulations were selected automatically from your organization's jurisdictions and this product's data types and use case. Use this list to align with compliance and audit."
        />
      </FadeIn>

      {items.length > 0 && (
        <FadeIn delay={0.05}>
          <p className="text-xs text-muted-foreground rounded-lg border border-border bg-muted/20 px-3 py-2">
            {COMPLIANCE_SOURCE_COPY}
          </p>
        </FadeIn>
      )}

      <FadeIn delay={0.05}>
        <StaggeredList className="grid gap-4">
          {items.map((item, i) => (
            <StaggeredItem key={i}>
              <Card className="transition-card hover-lift">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base">{item.regulation}</CardTitle>
                  {item.triggerSummary && (
                    <p className="text-sm font-medium text-foreground/90 rounded-md bg-primary/5 border border-primary/20 px-2.5 py-1.5">
                      Why this appears: {item.triggerSummary}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {item.applicability}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(item.requirements ?? []).map((req, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="h-2.5 w-2.5" />
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
      </FadeIn>
    </div>
  );
}
