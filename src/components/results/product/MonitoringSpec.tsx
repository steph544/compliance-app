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
  monitoringSpec: MonitoringSpecData;
}

export function MonitoringSpec({ monitoringSpec }: MonitoringSpecProps) {
  const { metrics, dashboardSpec, environmentalTracking } = monitoringSpec;

  return (
    <div className="space-y-6">
      {/* Metrics Table */}
      <FadeIn>
        <Card>
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

      {/* Dashboard Spec */}
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

      {/* Environmental Tracking */}
      {environmentalTracking && (
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Environmental Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  value={environmentalTracking.modelSize}
                  label="Model Size"
                  icon={Gauge}
                  accentColor="#6366f1"
                />
                <StatCard
                  value={environmentalTracking.inferenceVolume}
                  label="Inference Volume"
                  icon={Activity}
                  accentColor="#06b6d4"
                />
                <StatCard
                  value={environmentalTracking.estimatedFootprint}
                  label="Estimated Footprint"
                  icon={Leaf}
                  accentColor="#22c55e"
                />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
