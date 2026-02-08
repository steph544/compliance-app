"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/app/components/PageHeader";

export default function NewProjectPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();
  const { getOrganization, createProductAssessment, getOrganizationAssessment } = useData();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const org = getOrganization(orgId);
  const orgAssessment = getOrganizationAssessment(orgId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Project name is required.");
      return;
    }
    const assessment = createProductAssessment(orgId, trimmed);
    router.push(`/organizations/${orgId}/projects/${assessment.id}`);
  }

  if (!org) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Organization not found" backHref="/" />
        <p className="text-zinc-500 mt-4">This organization may have been removed.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Add AI project"
        backHref={`/organizations/${orgId}`}
        backLabel={org.name}
      />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {!orgAssessment && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 mb-6 text-amber-800 dark:text-amber-200 text-sm">
            Complete the{" "}
            <a
              href={`/organizations/${orgId}/assessment`}
              className="underline font-medium"
            >
              organization assessment
            </a>{" "}
            first to define your playbook. Product assessments will use that playbook.
          </div>
        )}
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Create a new product assessment for an AI project. You will execute Map, Measure, and
          Manage using your organization&apos;s playbook and provide project-specific details and
          evidence.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              AI project name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
              placeholder="e.g. Customer recommendation model"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Create project
            </button>
            <button
              type="button"
              onClick={() => router.push(`/organizations/${orgId}`)}
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
