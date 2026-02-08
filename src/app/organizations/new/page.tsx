"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/app/components/PageHeader";

export default function NewOrganizationPage() {
  const router = useRouter();
  const { createOrganization } = useData();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Organization name is required.");
      return;
    }
    const org = createOrganization(trimmed);
    router.push(`/organizations/${org.id}`);
  }

  return (
    <>
      <PageHeader title="Create organization" backHref="/" backLabel="Home" />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Organization name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
              placeholder="e.g. Acme Corp"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
