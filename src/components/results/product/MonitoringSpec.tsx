"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FadeIn } from "@/components/animation/FadeIn";
import { StatCard } from "@/components/ui/stat-card";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";
import { CHART_COLORS } from "@/components/charts/chart-colors";
import { Activity, Gauge, Leaf } from "lucide-react";

interface MonitoringSpecData {
  metrics: Array<{
    name: string;
    threshold: string;
    alertCondition: string;
  }>;
  thresholds: Record<string, string>;
  alerts: Record<string, string>;
  dashboardSpec: string;
  environmentalTracking?: {
    modelSize: string;
    inferenceVolume: string;
    estimatedFootprint: string;
  };
}

interface MonitoringSpecProps {
  monitoringSpec?: MonitoringSpecData | null;
}

export function MonitoringSpec({ monitoringSpec }: MonitoringSpecProps) {
  const spec = monitoringSpec ?? {};
  const { metrics = [], dashboardSpec = "", environmentalTracking } = spec;
  const hasMetrics = metrics.length > 0;
  const hasDashboardSpec = (dashboardSpec ?? "").toString().trim().length > 0;
  const hasContent = hasMetrics || hasDashboardSpec || environmentalTracking;

  return (
    <div className="space-y-6">
      <FadeIn>
        <ResultsSectionIntro
          description="Metrics, thresholds, and dashboard guidance for ongoing monitoring. Use this to set up alerts and track environmental impact."
        />
      </FadeIn>

      {!hasContent ? (
        <FadeIn delay={0.05}>
          <div className="rounded-lg border border-border bg-muted/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No monitoring specification defined yet.
            </p>
          </div>
        </FadeIn>
      ) : (
        <>
      {/* Metrics Table */}
      {hasMetrics && (
        <FadeIn delay={0.05}>
        <Card className="transition-card hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monitoring Metrics</CardTitle>
              <span className="text-sm text-muted-foreground">
                {(metrics ?? []).length} metrics tracked
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Alert Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(metrics ?? []).map((metric, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {metric.threshold}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {metric.alertCondition}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </FadeIn>
      )}

      {/* Dashboard Spec */}
      {hasDashboardSpec && (
        <FadeIn delay={0.1}>
          <Card className="transition-card hover-lift">
            <CardHeader>
              <CardTitle>Dashboard Specification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {dashboardSpec}
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Environmental Tracking */}
      {environmentalTracking && (
        <FadeIn delay={0.2}>
          <Card className="transition-card hover-lift">
            <CardHeader>
              <CardTitle>Environmental Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  value={environmentalTracking.modelSize}
                  label="Model Size"
                  icon={Gauge}
                  accentColor={CHART_COLORS[0]}
                />
                <StatCard
                  value={environmentalTracking.inferenceVolume}
                  label="Inference Volume"
                  icon={Activity}
                  accentColor={CHART_COLORS[1]}
                />
                <StatCard
                  value={environmentalTracking.estimatedFootprint}
                  label="Estimated Footprint"
                  icon={Leaf}
                  accentColor={CHART_COLORS[2]}
                />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
        </>
      )}
    </div>
  );
}
