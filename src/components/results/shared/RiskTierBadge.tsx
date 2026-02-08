import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tierConfig = {
  LOW: {
    label: "Low Risk",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  MEDIUM: {
    label: "Medium Risk",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  HIGH: {
    label: "High Risk",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  REGULATED: {
    label: "Regulated",
    className: "bg-red-100 text-red-800 border-red-200",
  },
} as const;

interface RiskTierBadgeProps {
  tier: "LOW" | "MEDIUM" | "HIGH" | "REGULATED";
  size?: "sm" | "lg";
}

export function RiskTierBadge({ tier, size = "sm" }: RiskTierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <Badge
      className={cn(
        config.className,
        size === "lg" && "px-4 py-2 text-base font-semibold",
        size === "sm" && "px-2 py-0.5 text-xs"
      )}
    >
      {config.label}
    </Badge>
  );
}
