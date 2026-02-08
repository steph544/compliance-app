"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animation/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/animation/StaggeredList";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";

interface ExportPanelProps {
  type: "org" | "product";
  exportUrl: string;
}

export function ExportPanel({ type, exportUrl }: ExportPanelProps) {
  const formats = [
    { label: "PDF Report", format: "pdf" },
    { label: "JSON Data", format: "json" },
    { label: "CSV Summary", format: "csv" },
    { label: "Markdown", format: "md" },
  ];

  const handleExport = (format: string) => {
    const url = `${exportUrl}?format=${format}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <ResultsSectionIntro
          description="Download assessment results for reporting, integration, or archival. Choose a format below; the file will open in a new tab."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="transition-card hover-lift">
          <CardHeader>
            <CardTitle>
              Export {type === "org" ? "Organization" : "Product"} Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StaggeredList className="grid grid-cols-2 gap-3" staggerDelay={0.04}>
              {formats.map(({ label, format }) => (
                <StaggeredItem key={format}>
                  <Button
                    variant="outline"
                    onClick={() => handleExport(format)}
                    className="w-full"
                  >
                    {label}
                  </Button>
                </StaggeredItem>
              ))}
            </StaggeredList>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
