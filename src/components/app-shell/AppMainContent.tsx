"use client";

import { usePathname } from "next/navigation";

/**
 * Wraps the main content with a key derived from pathname so the page
 * tree remounts on navigation. This fixes cases where client-side
 * navigation leaves the main area stale or blank.
 */
export function AppMainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname ?? "default"} className="contents">{children}</div>;
}
