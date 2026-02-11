"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/animation/FadeIn";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";

export interface DownloadSection {
  id: string;
  title: string;
}

interface ExportPanelProps {
  type: "org" | "product";
  exportUrl: string;
  sections: readonly DownloadSection[];
}

export function ExportPanel({ type, exportUrl, sections }: ExportPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id))
  );
  const [isLoading, setIsLoading] = useState<"pdf" | "docx" | null>(null);

  const allSelected = selectedIds.size === sections.length;
  const someSelected = selectedIds.size > 0;

  const toggleSection = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    []
  );

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sections.map((s) => s.id)));
    }
  }, [allSelected, sections]);

  const handleDownload = useCallback(
    async (format: "pdf" | "docx") => {
      if (!someSelected) return;
      const ids = sections
        .filter((s) => selectedIds.has(s.id))
        .map((s) => s.id);
      const url = `${exportUrl}?format=${format}&sections=${ids.join(",")}`;
      setIsLoading(format);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Download failed");
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${type}-report.${format === "pdf" ? "pdf" : "docx"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } catch {
        // Error handled silently
      } finally {
        setIsLoading(null);
      }
    },
    [exportUrl, someSelected, selectedIds, sections, type]
  );

  return (
    <div className="space-y-6">
      <FadeIn>
        <ResultsSectionIntro
          description="Select the sections to include in your report, then download as PDF or Word. Use Select all for a full report."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="transition-card hover-lift">
          <CardHeader>
            <CardTitle>
              Download {type === "org" ? "Organization" : "Product"} Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
              />
              <Label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer"
              >
                Select all
              </Label>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center space-x-2 rounded-md border p-3"
                >
                  <Checkbox
                    id={section.id}
                    checked={selectedIds.has(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Label
                    htmlFor={section.id}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {section.title}
                  </Label>
                </div>
              ))}
            </div>

            {!someSelected && (
              <p className="text-sm text-muted-foreground">
                Select at least one section to enable download.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="default"
                onClick={() => handleDownload("pdf")}
                disabled={!someSelected || isLoading !== null}
              >
                {isLoading === "pdf"
                  ? "Downloading..."
                  : "Download as PDF"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload("docx")}
                disabled={!someSelected || isLoading !== null}
              >
                {isLoading === "docx"
                  ? "Downloading..."
                  : "Download as Word"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
