"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CHART_COLORS } from "./chart-colors";

interface BarDataItem {
  name: string;
  value: number;
  description?: string;
}

interface HorizontalBarChartProps {
  data: BarDataItem[];
  color?: string;
  height?: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0].payload as BarDataItem;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">Score: {item.value}</p>
      {item.description && (
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          {item.description}
        </p>
      )}
    </div>
  );
}

export function HorizontalBarChart({
  data,
  height,
}: HorizontalBarChartProps) {
  const chartHeight = height ?? Math.max(200, data.length * 44);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
      >
        <XAxis type="number" domain={[0, "auto"]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar
          dataKey="value"
          radius={[0, 6, 6, 0]}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
