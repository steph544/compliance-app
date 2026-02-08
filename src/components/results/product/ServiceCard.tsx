"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animation/FadeIn";
import { AnimatedCard } from "@/components/animation/AnimatedCard";
import { ResultsSectionIntro } from "@/components/results/shared/ResultsSectionIntro";
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
            ? "bg-destructive/10 text-destructive"
            : "bg-muted/50 text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h3
          className={`text-sm font-semibold mb-1 ${
            variant === "danger" ? "text-destructive" : "text-foreground"
          }`}
        >
          {title}
        </h3>
        <div
          className={`text-sm whitespace-pre-wrap rounded-lg border p-3 ${
            variant === "danger"
              ? "text-destructive/90 bg-destructive/5 border-destructive/20"
              : "text-muted-foreground bg-muted/20 border-border"
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
    <div className="space-y-6">
      <FadeIn>
        <ResultsSectionIntro
          description="A one-page summary of the AI service for stakeholders and auditors. Share or download for documentation and compliance reviews."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <AnimatedCard accentColor="#6366f1">
          <CardHeader className="border-b border-border bg-muted/30">
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
        </AnimatedCard>
      </FadeIn>
    </div>
  );
}
