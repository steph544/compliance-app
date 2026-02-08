"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { AnimatedCard } from "@/components/animation/AnimatedCard";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { ChevronDown, ChevronRight } from "lucide-react";

const FACTOR_LABELS: Record<string, string> = {
  overall_impact: "Overall impact",
  ai_maturity: "AI maturity",
  data_sensitivity: "Data sensitivity",
  automated_decisions: "Automated decisions",
  customer_facing: "Customer-facing AI",
  governance_gaps: "Governance gaps",
  existing_governance: "Existing governance",
  eu_jurisdiction: "EU jurisdiction",
  us_regulated_data: "US regulated data",
  multi_jurisdiction: "Multi-jurisdiction",
  safety_sensitivity: "Safety sensitivity",
  reputational_risk: "Reputational risk",
  risk_tolerance: "Risk tolerance",
};

function factorToLabel(factor: string): string {
  return (
    FACTOR_LABELS[factor] ??
    factor
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
  );
}

interface RiskDriver {
  factor: string;
  scoreContribution?: number;
  contribution?: number;
  explanation: string;
}

interface OrgRiskSummaryProps {
  result: {
    riskTier: "LOW" | "MEDIUM" | "HIGH" | "REGULATED";
    riskScore: number;
    riskDrivers: RiskDriver[];
  };
}

function getContribution(d: RiskDriver): number {
  return d.contribution ?? d.scoreContribution ?? 0;
}

function getWhyRatingCopy(score: number, tier: string): string {
  const tierExplanations: Record<string, string> = {
    REGULATED:
      "Regulated tier applies when the score is 19 or higher, or when you process regulated data (e.g. PHI, PCI, children's data) in the EU.",
    HIGH: "High tier applies when the score is between 13 and 18.",
    MEDIUM: "Medium tier applies when the score is between 7 and 12.",
    LOW: "Low tier applies when the score is below 7.",
  };
  const tierCopy = tierExplanations[tier] ?? "The tier is based on score thresholds and regulatory context.";
  return `Your risk score (1–25) is based on impact, likelihood, governance adjustments, and jurisdiction. ${tierCopy} Your score of ${score} places you in the ${tier.replace("_", " ").toLowerCase()} tier.`;
}

export function OrgRiskSummary({ result }: OrgRiskSummaryProps) {
  const drivers = [...(result.riskDrivers ?? [])].sort(
    (a, b) => getContribution(b) - getContribution(a)
  );

  const barData = drivers.map((d) => ({
    name: factorToLabel(d.factor),
    value: getContribution(d),
    description: d.explanation,
  }));

  return (
    <div className="space-y-8">
      {/* Risk Overview - Gauge + Why this rating + Bar Chart */}
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Risk Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Gauge + Why this rating */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-4">
                <RiskGauge
                  score={result.riskScore}
                  tier={result.riskTier}
                  size="lg"
                  max={25}
                />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Overall Risk Tier
                    </p>
                    <StatusIndicator
                      variant={{ type: "riskTier", value: result.riskTier }}
                      className="text-base font-medium"
                    />
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Why this rating
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getWhyRatingCopy(result.riskScore, result.riskTier)}
                  </p>
                </div>
              </div>

              {/* Bar Chart */}
              {barData.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    Risk driver contributions
                  </p>
                  <HorizontalBarChart data={barData} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Risk Driver Details - expandable cards with readable labels */}
      {drivers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Risk driver details</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Each factor below contributes to your overall risk score. Expand a card to read what it means for your organization.
          </p>
          <StaggeredList className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drivers.map((driver, i) => (
              <DriverCard
                key={driver.factor}
                driver={driver}
                delay={i * 0.05}
              />
            ))}
          </StaggeredList>
        </div>
      )}
    </div>
  );
}

function DriverCard({
  driver,
  delay,
}: {
  driver: RiskDriver;
  delay: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const label = factorToLabel(driver.factor);
  const contribution = getContribution(driver);

  return (
    <StaggeredItem>
      <AnimatedCard delay={delay} className="overflow-hidden transition-all hover:shadow-sm">
        <CardHeader
          className="cursor-pointer py-4"
          onClick={() => setExpanded((e) => !e)}
        >
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <span className="text-left font-medium">{label}</span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-normal text-muted-foreground tabular-nums">
                {contribution >= 0 ? "+" : ""}{contribution}
              </span>
              <button
                type="button"
                className="p-0.5 rounded hover:bg-muted transition-colors"
                aria-expanded={expanded}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((prev) => !prev);
                }}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </span>
          </CardTitle>
        </CardHeader>
        {expanded && (
          <CardContent className="pt-0 pb-4 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 mt-3">
              What this means
            </p>
            <p className="text-sm text-muted-foreground">
              {driver.explanation}
            </p>
          </CardContent>
        )}
      </AnimatedCard>
    </StaggeredItem>
  );
}
