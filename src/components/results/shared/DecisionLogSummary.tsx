"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface DecisionLogData {
  computedAt: string;
  riskTier: string;
  riskScore: number;
  driverSummary?: Array<{ factor: string; contribution?: number; explanation?: string }>;
  rulesFired?: Array<{ ruleId: string; controlIds: string[] }>;
  controlSelectionCount?: number;
}

interface DecisionLogSummaryProps {
  decisionLog: DecisionLogData | null | undefined;
  /** "product" shows control count; "org" shows control selection count */
  scope?: "product" | "org";
}

function formatFactor(factor: string): string {
  return factor
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function DecisionLogSummary({ decisionLog, scope = "product" }: DecisionLogSummaryProps) {
  if (!decisionLog) return null;

  const { computedAt, riskTier, riskScore, driverSummary, rulesFired, controlSelectionCount } = decisionLog;
  const ruleIds = rulesFired?.map((r) => r.ruleId) ?? [];
  const hasRules = ruleIds.length > 0;

  return (
    <Card className="border-muted/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">How this was determined</CardTitle>
        <p className="text-xs text-muted-foreground">
          Computed at {new Date(computedAt).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="text-muted-foreground">Risk tier: </span>
          <Badge variant="secondary" className="font-medium">
            {riskTier}
          </Badge>
          {" "}
          (score {riskScore})
        </p>
        {Array.isArray(driverSummary) && driverSummary.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-1">Drivers:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              {driverSummary.slice(0, 8).map((d, i) => (
                <li key={i}>
                  {formatFactor(d.factor)}
                  {d.explanation ? ` — ${d.explanation}` : ""}
                </li>
              ))}
              {driverSummary.length > 8 && (
                <li className="text-muted-foreground/80">+{driverSummary.length - 8} more</li>
              )}
            </ul>
          </div>
        )}
        {hasRules && (
          <p className="text-muted-foreground">
            Controls selected by rules: {ruleIds.join(", ")}
          </p>
        )}
        {typeof controlSelectionCount === "number" && (
          <p className="text-muted-foreground">
            {scope === "product" ? "Technical controls" : "Control selections"}: {controlSelectionCount}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
