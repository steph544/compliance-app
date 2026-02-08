"use client";

import Link from "next/link";

export function PageHeader({
  title,
  backHref,
  backLabel = "Back",
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="border-b border-border bg-card px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {backLabel}
          </Link>
        )}
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
    </header>
  );
}
