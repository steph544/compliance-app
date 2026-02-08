"use client";

export function getCSSVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export const RISK_TIER_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  REGULATED: "#a855f7",
};

export const DESIGNATION_COLORS: Record<string, string> = {
  REQUIRED: "#ef4444",
  RECOMMENDED: "#f59e0b",
  OPTIONAL: "#9ca3af",
};

export const CHART_COLORS = [
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
];
