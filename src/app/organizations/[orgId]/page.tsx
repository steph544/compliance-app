"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/context/DataContext";
import { PageHeader } from "@/app/components/PageHeader";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const { getOrganization, getOrganizationAssessment, getProductAssessments } = useData();

  const org = getOrganization(orgId);
  const orgAssessment = getOrganizationAssessment(orgId);
  const projects = getProductAssessments(orgId);

  if (!org) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Organization not found" backHref="/" />
        <p className="text-zinc-500 mt-4">This organization may have been removed.</p>
        <Link href="/" className="text-blue-600 dark:text-blue-400 mt-2 inline-block">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={org.name} backHref="/" backLabel="Home" />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Organization-level assessment (Govern + playbook) */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Organization assessment (Govern)</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Define policies, roles, risk tolerance, and your common methods, templates, and tools
            for Map, Measure, and Manage. This is your playbook for all AI projects.
          </p>
          <Link
            href={`/organizations/${orgId}/assessment`}
            className="block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 hover:border-zinc-300 dark:hover:border-zinc-600"
          >
            <span className="font-medium">
              {orgAssessment ? "Edit organization assessment" : "Start organization assessment"}
            </span>
            {orgAssessment && (
              <span className="text-zinc-500 text-sm block mt-1">
                Last updated {new Date(orgAssessment.updatedAt).toLocaleDateString()}
              </span>
            )}
          </Link>
        </section>

        {/* Product assessments (Map, Measure, Manage) */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">AI projects (product assessments)</h2>
            <Link
              href={`/organizations/${orgId}/projects/new`}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 text-sm font-medium hover:opacity-90"
            >
              Add project
            </Link>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Execute Map, Measure, and Manage using your organization playbook. One assessment per
            AI project, with project-specific details and evidence.
          </p>
          {projects.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 text-center text-zinc-500">
              <p>No AI projects yet.</p>
              <p className="mt-2">
                <Link
                  href={`/organizations/${orgId}/projects/new`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Add your first project
                </Link>
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/organizations/${orgId}/projects/${p.id}`}
                    className="block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 hover:border-zinc-300 dark:hover:border-zinc-600"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-zinc-500 text-sm block mt-0.5">
                      Map → Measure → Manage · Updated{" "}
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
