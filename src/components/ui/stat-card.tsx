"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animation/AnimatedNumber";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  value: number | string;
  label: string;
  icon?: LucideIcon;
  accentColor?: string;
  className?: string;
}

export function StatCard({
  value,
  label,
  icon: Icon,
  accentColor = "#6366f1",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn("transition-card hover-lift overflow-hidden", className)}
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <CardContent className="flex items-center gap-4 py-4">
        {Icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
          </div>
        )}
        <div className="min-w-0">
          {typeof value === "number" ? (
            <AnimatedNumber
              value={value}
              className="text-2xl font-bold tabular-nums"
            />
          ) : (
            <span className="text-2xl font-bold">{value}</span>
          )}
          <p className="text-sm text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
