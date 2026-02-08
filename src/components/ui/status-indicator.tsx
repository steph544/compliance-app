import { cn } from "@/lib/utils";

const RISK_TIER_CONFIG = {
  LOW: { dot: "bg-green-500", label: "Low" },
  MEDIUM: { dot: "bg-amber-500", label: "Medium" },
  HIGH: { dot: "bg-accent-orange", label: "High" },
  REGULATED: { dot: "bg-slate-600", label: "Regulated" },
} as const;

const ASSESSMENT_STATUS_CONFIG = {
  COMPLETED: { dot: "bg-green-500", label: "Completed" },
  IN_PROGRESS: { dot: "bg-amber-500", label: "In progress" },
  DRAFT: { dot: "bg-muted-foreground", label: "Draft" },
} as const;

type RiskTier = keyof typeof RISK_TIER_CONFIG;
type AssessmentStatus = keyof typeof ASSESSMENT_STATUS_CONFIG;

export type StatusIndicatorVariant =
  | { type: "riskTier"; value: RiskTier }
  | { type: "assessmentStatus"; value: AssessmentStatus | string };

interface StatusIndicatorProps {
  variant: StatusIndicatorVariant;
  label?: string;
  className?: string;
}

function getConfig(variant: StatusIndicatorVariant): { dot: string; label: string } {
  if (variant.type === "riskTier" && variant.value in RISK_TIER_CONFIG) {
    return RISK_TIER_CONFIG[variant.value as RiskTier];
  }
  if (variant.type === "assessmentStatus" && variant.value in ASSESSMENT_STATUS_CONFIG) {
    return ASSESSMENT_STATUS_CONFIG[variant.value as AssessmentStatus];
  }
  if (variant.type === "assessmentStatus") {
    return {
      dot: "bg-muted-foreground",
      label: String(variant.value).replace(/_/g, " "),
    };
  }
  return { dot: "bg-muted-foreground", label: String(variant.value) };
}

export function StatusIndicator({ variant, label: labelOverride, className }: StatusIndicatorProps) {
  const { dot, label } = getConfig(variant);
  const displayLabel = labelOverride ?? label;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm text-foreground", className)}
      role="status"
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} aria-hidden />
      {displayLabel}
    </span>
  );
}
