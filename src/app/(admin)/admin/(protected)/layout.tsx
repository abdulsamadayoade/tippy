import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/admin-session";
import type { ReactNode } from "react";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const gate = await checkAdminAccess();

  if (gate.status !== "ok") redirect("/admin/verify");

  return children;
}
