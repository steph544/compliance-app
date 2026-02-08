"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RiskTierBadge } from "@/components/results/shared/RiskTierBadge";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { AnimatedCard } from "@/components/animation/AnimatedCard";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { StatCard } from "@/components/ui/stat-card";
import { Shield, ShieldCheck } from "lucide-react";
import { RISK_TIER_COLORS } from "@/components/charts/chart-colors";

interface FitForAiResult {
  validated: boolean;
  concerns: string[];
  recommendation: string;
}

interface StakeholderMap {
  upstream: string[];
  downstream: string[];
  inclusionConcerns?: string[];
}

type RiskDriver =
  | string
  | { factor: string; explanation: string; contribution: number };

interface ProductRiskAssessmentProps {
  result: {
    riskTier: string;
    riskScore: number;
    riskDrivers: RiskDriver[];
    fitForAiResult: FitForAiResult;
    stakeholderMap: StakeholderMap;
  };
  orgRiskTier: string;
}

export function ProductRiskAssessment({
  result,
  orgRiskTier,
}: ProductRiskAssessmentProps) {
  const { riskTier, riskScore, riskDrivers, fitForAiResult, stakeholderMap } =
    result;

  const objectDrivers = (riskDrivers ?? []).filter(
    (d): d is { factor: string; explanation: string; contribution: number } =>
      typeof d !== "string"
  );
  const stringDrivers = (riskDrivers ?? []).filter(
    (d): d is string => typeof d === "string"
  );

  const barData = [...objectDrivers]
    .sort((a, b) => b.contribution - a.contribution)
    .map((d) => ({
      name: d.factor,
      value: d.contribution,
      description: d.explanation,
    }));

  return (
    <div className="space-y-6">
      {/* Risk Classification - Gauge + Tier Comparison */}
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Risk Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center gap-3">
                <RiskGauge score={riskScore} tier={riskTier} size="lg" />
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <StatCard
                  value={riskTier}
                  label="Product Risk Tier"
                  icon={Shield}
                  accentColor={RISK_TIER_COLORS[riskTier] ?? "#6366f1"}
                />
                <StatCard
                  value={orgRiskTier}
                  label="Org Baseline Tier"
                  icon={ShieldCheck}
                  accentColor={RISK_TIER_COLORS[orgRiskTier] ?? "#94a3b8"}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Fit-for-AI Result */}
      <FadeIn delay={0.1}>
        <AnimatedCard
          accentColor={fitForAiResult.validated ? "#22c55e" : "#ef4444"}
        >
          <CardHeader>
            <CardTitle>Fit-for-AI Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {fitForAiResult.validated ? (
                <>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="font-medium text-green-700">
                    Validated for AI use
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                  <span className="font-medium text-red-700">
                    Not validated for AI use
                  </span>
                </>
              )}
            </div>

            {(fitForAiResult.concerns ?? []).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Concerns</p>
                <ul className="space-y-1">
                  {(fitForAiResult.concerns ?? []).map((concern, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-yellow-500 mt-0.5">&#9888;</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm font-medium mb-1">Recommendation</p>
              <p className="text-sm text-muted-foreground">
                {fitForAiResult.recommendation}
              </p>
            </div>
          </CardContent>
        </AnimatedCard>
      </FadeIn>

      {/* Stakeholder Map */}
      <FadeIn delay={0.2}>
        <Card className="transition-card hover-lift">
          <CardHeader>
            <CardTitle>Stakeholder Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Upstream Contributors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(stakeholderMap.upstream ?? []).map((item, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Downstream Stakeholders
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(stakeholderMap.downstream ?? []).map((item, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {stakeholderMap.inclusionConcerns &&
              stakeholderMap.inclusionConcerns.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Inclusion Concerns
                    </h4>
                    <ul className="space-y-1">
                      {stakeholderMap.inclusionConcerns.map((concern, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-orange-500 mt-0.5">
                            &#9888;
                          </span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Risk Drivers */}
      <FadeIn delay={0.3}>
        <Card className="transition-card hover-lift">
          <CardHeader>
            <CardTitle>Risk Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 && (
              <div className="mb-6">
                <HorizontalBarChart data={barData} />
              </div>
            )}

            {stringDrivers.length > 0 && (
              <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stringDrivers.map((driver, i) => (
                  <StaggeredItem key={i}>
                    <Card className="py-3 transition-card hover-lift">
                      <CardContent className="py-0">
                        <p className="text-sm">{driver}</p>
                      </CardContent>
                    </Card>
                  </StaggeredItem>
                ))}
              </StaggeredList>
            )}

            {objectDrivers.length > 0 && (
              <StaggeredList className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {objectDrivers.map((driver, i) => (
                  <StaggeredItem key={i}>
                    <Card className="py-3 transition-card hover-lift">
                      <CardContent className="py-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{driver.factor}</p>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            +{driver.contribution}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {driver.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  </StaggeredItem>
                ))}
              </StaggeredList>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
