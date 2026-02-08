"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskTierBadge } from "@/components/results/shared/RiskTierBadge";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { AnimatedCard } from "@/components/animation/AnimatedCard";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";

interface RiskDriver {
  factor: string;
  scoreContribution: number;
  explanation: string;
}

interface OrgRiskSummaryProps {
  result: {
    riskTier: "LOW" | "MEDIUM" | "HIGH" | "REGULATED";
    riskScore: number;
    riskDrivers: RiskDriver[];
  };
}

export function OrgRiskSummary({ result }: OrgRiskSummaryProps) {
  const drivers = [...(result.riskDrivers ?? [])].sort(
    (a, b) => b.scoreContribution - a.scoreContribution
  );

  const barData = drivers.map((d) => ({
    name: d.factor,
    value: d.scoreContribution,
    description: d.explanation,
  }));

  return (
    <div className="space-y-8">
      {/* Risk Overview - Gauge + Bar Chart */}
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Risk Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Gauge */}
              <div className="flex flex-col items-center gap-4">
                <RiskGauge
                  score={result.riskScore}
                  tier={result.riskTier}
                  size="lg"
                />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Overall Risk Tier
                  </p>
                  <RiskTierBadge tier={result.riskTier} size="lg" />
                </div>
              </div>

              {/* Bar Chart */}
              {barData.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    Risk Driver Contributions
                  </p>
                  <HorizontalBarChart data={barData} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Risk Driver Details */}
      {drivers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Risk Driver Details</h3>
          <StaggeredList className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drivers.map((driver, i) => (
              <StaggeredItem key={driver.factor}>
                <AnimatedCard delay={i * 0.05}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      {driver.factor}
                      <span className="text-sm font-normal text-muted-foreground tabular-nums">
                        +{driver.scoreContribution}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {driver.explanation}
                    </p>
                  </CardContent>
                </AnimatedCard>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      )}
    </div>
  );
}
