import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/admin-session";
import { Logo } from "@/components/elements/logo";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const gate = await checkAdminAccess();

  if (gate.status === "unauthenticated") redirect("/login");
  if (gate.status === "forbidden") notFound();

  return (
    <main className="min-h-screen bg-white" id="main-content">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-240 items-center gap-4 px-5.5 py-3">
          <Link className="flex items-center gap-2" href="/admin">
            <Logo />
            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger uppercase">
              Operations
            </span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-240 px-5.5 pt-7 pb-15 max-sm:px-4">
        {children}
      </div>
    </main>
  );
}
