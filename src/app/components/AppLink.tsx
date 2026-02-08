"use client";

import Link from "next/link";

export function AppLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`text-blue-600 dark:text-blue-400 hover:underline ${className}`}
    >
      {children}
    </Link>
  );
}
