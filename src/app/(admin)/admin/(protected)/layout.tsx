import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/admin-session";
import Link from "next/link";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/lookup", label: "Lookup" },
  { href: "/admin/creators", label: "Creators" },
  { href: "/admin/adjustments", label: "Adjustments" },
  { href: "/admin/audit", label: "Audit" },
  { href: "/admin/reports", label: "Reports" },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const gate = await checkAdminAccess();

  if (gate.status !== "ok") redirect("/admin/verify");

  return (
    <>
      <nav className="mb-8 flex flex-wrap gap-1.5" aria-label="Operator">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            className="rounded-full bg-soft px-3.5 py-1.5 text-sm font-medium text-ink hover:bg-line"
            href={href}>
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </>
  );
}
