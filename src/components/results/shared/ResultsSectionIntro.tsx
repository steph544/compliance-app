"use client";

interface ResultsSectionIntroProps {
  /** Optional section title when different from tab label */
  title?: string;
  /** Short explanation of what this section shows and why it matters */
  description: string;
}

export function ResultsSectionIntro({
  title,
  description,
}: ResultsSectionIntroProps) {
  return (
    <div className="rounded-xl border border-border border-l-2 border-l-accent-primary bg-muted/20 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {title && (
        <h2 className="text-sm font-semibold text-foreground mb-1">{title}</h2>
      )}
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
