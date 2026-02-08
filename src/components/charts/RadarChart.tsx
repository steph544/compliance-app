"use client";

import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarDimension {
  name: string;
  value: number;
  fullMark: number;
}

interface RadarChartProps {
  dimensions: RadarDimension[];
  height?: number;
  color?: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">
        Score: {item.value} / {item.fullMark}
      </p>
    </div>
  );
}

export function RadarChart({
  dimensions,
  height = 320,
  color = "#6366f1",
}: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={dimensions} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#64748b" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 4]}
          tickCount={5}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
