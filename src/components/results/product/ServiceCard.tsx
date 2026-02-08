"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animation/FadeIn";
import {
  Target,
  Cpu,
  Database,
  AlertTriangle,
  ShieldOff,
  Eye,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceCardData {
  purpose: string;
  model: string;
  data: string;
  limitations: string;
  prohibitedUses: string;
  oversight: string;
  monitoring: string;
}

interface ServiceCardProps {
  serviceCard: ServiceCardData;
}

function generateMarkdown(card: ServiceCardData): string {
  return `# AI Service Card

## Purpose & Intended Use
${card.purpose}

## Model Information
${card.model}

## Training Data & Provenance
${card.data}

## Known Limitations
${card.limitations}

## Prohibited Uses
${card.prohibitedUses}

## Human Oversight Level
${card.oversight}

## Monitoring Requirements
${card.monitoring}
`;
}

function Section({
  title,
  icon: Icon,
  children,
  variant,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  variant?: "danger";
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          variant === "danger"
            ? "bg-red-100 text-red-600"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h3
          className={`text-sm font-semibold mb-1 ${
            variant === "danger" ? "text-red-600" : "text-foreground"
          }`}
        >
          {title}
        </h3>
        <div
          className={`text-sm whitespace-pre-wrap ${
            variant === "danger"
              ? "text-red-600/80 bg-red-50 rounded-md p-3 border border-red-200"
              : "text-muted-foreground"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function ServiceCard({ serviceCard }: ServiceCardProps) {
  const handleDownload = () => {
    const markdown = generateMarkdown(serviceCard);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-service-card.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FadeIn>
      <Card className="border-2 transition-card">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">AI Service Card</CardTitle>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              Download as Markdown
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Section title="Purpose & Intended Use" icon={Target}>
            {serviceCard.purpose}
          </Section>

          <Separator />

          <Section title="Model Information" icon={Cpu}>
            {serviceCard.model}
          </Section>

          <Separator />

          <Section title="Training Data & Provenance" icon={Database}>
            {serviceCard.data}
          </Section>

          <Separator />

          <Section title="Known Limitations" icon={AlertTriangle}>
            {serviceCard.limitations}
          </Section>

          <Separator />

          <Section title="Prohibited Uses" icon={ShieldOff} variant="danger">
            {serviceCard.prohibitedUses}
          </Section>

          <Separator />

          <Section title="Human Oversight Level" icon={Eye}>
            {serviceCard.oversight}
          </Section>

          <Separator />

          <Section title="Monitoring Requirements" icon={Activity}>
            {serviceCard.monitoring}
          </Section>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
