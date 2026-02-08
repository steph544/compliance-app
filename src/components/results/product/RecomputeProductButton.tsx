"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface RecomputeProductButtonProps {
  orgAssessmentId: string;
  productId: string;
  className?: string;
}

export function RecomputeProductButton({
  orgAssessmentId,
  productId,
  className,
}: RecomputeProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRecompute() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/org-assessments/${orgAssessmentId}/products/${productId}/compute`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Recompute failed");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleRecompute}
      disabled={loading}
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Recomputing…" : "Recompute results"}
    </Button>
  );
}
