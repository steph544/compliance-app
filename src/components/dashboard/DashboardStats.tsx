"use client";

import { StatCard } from "@/components/ui/stat-card";
import { DonutChart } from "@/components/charts/DonutChart";
import { FadeIn } from "@/components/animation/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, Boxes, ShieldAlert } from "lucide-react";
import { RISK_TIER_COLORS } from "@/components/charts/chart-colors";

interface DashboardStatsProps {
  totalAssessments: number;
  completedAssessments: number;
  totalProducts: number;
  riskDistribution: Record<string, number>;
}

export function DashboardStats({
  totalAssessments,
  completedAssessments,
  totalProducts,
  riskDistribution,
}: DashboardStatsProps) {
  const donutData = Object.entries(riskDistribution)
    .filter(([, count]) => count > 0)
    .map(([tier, count]) => ({
      name: `${tier} Risk`,
      value: count,
      color: RISK_TIER_COLORS[tier] ?? "#94a3b8",
    }));

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={0}>
          <StatCard
            value={totalAssessments}
            label="Total Assessments"
            icon={Building2}
            accentColor="#6366f1"
          />
        </FadeIn>
        <FadeIn delay={0.05}>
          <StatCard
            value={completedAssessments}
            label="Completed"
            icon={CheckCircle}
            accentColor="#22c55e"
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <StatCard
            value={totalProducts}
            label="Product Assessments"
            icon={Boxes}
            accentColor="#f59e0b"
          />
        </FadeIn>
        <FadeIn delay={0.15}>
          <StatCard
            value={donutData.length > 0 ? donutData.length : 0}
            label="Risk Tiers Active"
            icon={ShieldAlert}
            accentColor="#ef4444"
          />
        </FadeIn>
      </div>

      {/* Risk Distribution Chart */}
      {donutData.length > 0 && (
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs mx-auto">
                <DonutChart
                  data={donutData}
                  centerLabel="Assessments"
                  height={240}
                />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
