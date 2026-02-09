"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RecomputeButtonProps {
  assessmentId: string;
  className?: string;
}

export function RecomputeButton({ assessmentId, className }: RecomputeButtonProps) {
  const router = useRouter();
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecompute = async () => {
    setIsRecomputing(true);
    setError(null);
    try {
      const res = await fetch(`/api/org-assessments/${assessmentId}/compute`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Recompute failed (${res.status})`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recompute failed");
    } finally {
      setIsRecomputing(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleRecompute}
        disabled={isRecomputing}
      >
        <RefreshCw className={`h-4 w-4 ${isRecomputing ? "animate-spin" : ""}`} />
        {isRecomputing ? "Recomputing…" : "Recompute"}
      </Button>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
