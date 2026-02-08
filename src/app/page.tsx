"use client";

import { useData } from "@/context/DataContext";
import { AppLink } from "./components/AppLink";
import Link from "next/link";

export default function HomePage() {
  const { data, organizationsLoadError, refresh } = useData();
  const orgs = data.organizations;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          AI Governance & Compliance
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          NIST AI RMF – organization and product-level assessments. Define your playbook at the
          organization level, then execute it for each AI project.
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Organizations</h2>
        <Link
          href="/organizations/new"
          className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Create organization
        </Link>
      </div>

      {organizationsLoadError ? (
        <div className="rounded-xl border border-border bg-muted/50 p-6 text-center">
          <p className="font-medium text-foreground">{organizationsLoadError}</p>
          <button
            type="button"
            onClick={() => refresh()}
            className="mt-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : orgs.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center text-zinc-500">
          <p>No organizations yet.</p>
          <p className="mt-2">
            <AppLink href="/organizations/new">Create your first organization</AppLink> to get
            started.
          </p>
        </div>
      ) : (
        <>
        <ul className="space-y-2">
          {orgs.map((org) => (
            <li key={org.id}>
              <Link
                href={`/organizations/${org.id}`}
                className="block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 hover:border-zinc-300 dark:hover:border-zinc-600"
              >
                <span className="font-medium">{org.name}</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-sm ml-2">
                  View assessment & projects
                </span>
              </Link>
            </li>
          ))}
        </ul>
        </>
      )}
    </div>
  );
}
