import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-shell/AppSidebar";
import { AppMainContent } from "@/components/app-shell/AppMainContent";

function SidebarFallback() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-border px-4" />
      <div className="flex-1 overflow-y-auto p-2" />
    </aside>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Suspense fallback={<SidebarFallback />}>
        <AppSidebar />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col pl-56">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <Link href="/dashboard" className="text-lg font-semibold text-foreground">
            AI Governance Platform
          </Link>
          <UserButton />
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">
          <AppMainContent>{children}</AppMainContent>
        </main>
      </div>
    </div>
  );
}
