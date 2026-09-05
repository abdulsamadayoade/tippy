import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/admin-session";
import { AdminVerifyForm } from "@/modules/admin/components/verify-form";

export default async function AdminVerifyPage() {
  const gate = await checkAdminAccess();

  if (gate.status === "ok") redirect("/admin");

  return (
    <div className="pt-10">
      <AdminVerifyForm
        mode={gate.status === "enrollment-required" ? "enroll" : "verify"}
      />
    </div>
  );
}
