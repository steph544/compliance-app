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
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← {backLabel}
          </Link>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
    </header>
  );
}
