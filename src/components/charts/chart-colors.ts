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
  HIGH: "#ea580c",
  REGULATED: "#475569",
};

export const DESIGNATION_COLORS: Record<string, string> = {
  REQUIRED: "#334155",
  RECOMMENDED: "#64748b",
  OPTIONAL: "#94a3b8",
};

export const CHART_COLORS = [
  "#2563eb",
  "#475569",
  "#64748b",
  "#0f172a",
  "#1e293b",
];
