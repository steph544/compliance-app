"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Shield,
  Calendar,
  FileText,
  Package,
  Download,
  BookOpen,
  ClipboardList,
} from "lucide-react";

const globalNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/org/new", label: "New assessment", icon: PlusCircle },
] as const;

const resultsSections = [
  { section: "summary", label: "Summary", icon: BarChart3 },
  { section: "heatmap", label: "Readiness Heatmap", icon: BarChart3 },
  { section: "nist", label: "NIST Compliance", icon: Shield },
  { section: "monitoring", label: "Monitoring Plan", icon: Calendar },
  { section: "policies", label: "Policy Drafts", icon: FileText },
  { section: "products", label: "Product Assessments", icon: Package },
  { section: "export", label: "Download", icon: Download },
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-accent-primary/10 text-accent-primary border-l-2 border-accent-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

/** Renders assessment sub-nav (results sections, governance, registry). Only used when we have orgId; uses useSearchParams so must be in Suspense on results. */
function SidebarAssessmentNav({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = searchParams.get("section") ?? "summary";
  const isResults = pathname === `/org/${orgId}/results`;
  const isGovernance = pathname === `/org/${orgId}/governance`;
  const isRegistry = pathname === `/org/${orgId}/registry` || pathname.startsWith(`/org/${orgId}/registry/`);

  return (
    <>
      <div className="mt-4 px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Assessment
      </div>
      {resultsSections.map((item) => {
        const href = `/org/${orgId}/results?section=${item.section}`;
        const active = isResults && section === item.section;
        return (
          <NavLink
            key={item.section}
            href={href}
            label={item.label}
            icon={item.icon}
            active={!!active}
          />
        );
      })}
      <NavLink
        href={`/org/${orgId}/governance`}
        label="Governance (implementation)"
        icon={BookOpen}
        active={isGovernance}
      />
      <NavLink
        href={`/org/${orgId}/registry`}
        label="Registry"
        icon={ClipboardList}
        active={isRegistry}
      />
    </>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const orgMatch = pathname.match(/^\/org\/([^/]+)/);
  const orgId = orgMatch?.[1] ?? null;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <Link href="/dashboard" className="font-semibold text-foreground" prefetch={true}>
          AI Governance
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Overview
        </div>
        {globalNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
          />
        ))}

        {orgId ? (
          <Suspense fallback={<div className="mt-4 px-2 py-1.5 text-xs text-muted-foreground">Loading…</div>}>
            <SidebarAssessmentNav orgId={orgId} />
          </Suspense>
        ) : null}
      </div>
    </aside>
  );
}
