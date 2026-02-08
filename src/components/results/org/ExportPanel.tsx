"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExportPanelProps {
  assessmentId: string;
  type: "org" | "product";
}

export function ExportPanel({ assessmentId, type }: ExportPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const endpoint =
    type === "org"
      ? `/api/org-assessments/${assessmentId}/export`
      : `/api/product-assessments/${assessmentId}/export`;

  async function handleDownload() {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-assessment-${assessmentId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Error handled silently - user sees button state reset
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Export Assessment</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">JSON Export</CardTitle>
          <CardDescription>
            Download the full assessment results as a JSON file. This includes
            all risk scores, governance blueprints, control selections, and
            policy drafts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium mb-2">Export includes:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Risk tier and score breakdown</li>
              <li>Readiness heatmap dimensions</li>
              <li>Governance blueprint and RACI matrix</li>
              <li>NIST AI RMF mapping</li>
              <li>Control selections and designations</li>
              <li>Monitoring plan and operations runbook</li>
              <li>Policy drafts</li>
              {type === "org" && <li>Product assessment summaries</li>}
            </ul>
          </div>

          <Button onClick={handleDownload} disabled={isLoading}>
            {isLoading ? "Downloading..." : "Download JSON"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
