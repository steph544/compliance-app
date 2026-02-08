"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { RISK_TIER_COLORS } from "./chart-colors";

interface RiskGaugeProps {
  score: number;
  tier?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { width: 120, height: 120, inner: 38, outer: 50, fontSize: "text-xl" },
  md: { width: 160, height: 160, inner: 50, outer: 66, fontSize: "text-3xl" },
  lg: { width: 200, height: 200, inner: 62, outer: 82, fontSize: "text-4xl" },
};

export function RiskGauge({ score, tier, size = "md" }: RiskGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const config = sizeMap[size];
  const fillColor = tier ? RISK_TIER_COLORS[tier] ?? "#6366f1" : "#6366f1";

  const data = [
    { name: "score", value: clampedScore },
    { name: "remainder", value: 100 - clampedScore },
  ];

  return (
    <div
      className="relative"
      style={{ width: config.width, height: config.height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={config.inner}
            outerRadius={config.outer}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            <Cell fill={fillColor} />
            <Cell fill="#f1f5f9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${config.fontSize} font-bold tabular-nums`}>
          {clampedScore}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
