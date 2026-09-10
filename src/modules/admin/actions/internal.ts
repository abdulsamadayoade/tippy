import "server-only";

import { revalidatePath } from "next/cache";
import { requireAdminForAction } from "@/lib/admin-session";
import { consumeRateLimit } from "@/lib/rate-limit";
import type { AdminContext } from "../types";

export async function requireAdminWithLimit(): Promise<
  { error: string } | AdminContext
> {
  const gate = await requireAdminForAction();
  if ("error" in gate) return gate;

  const limit = await consumeRateLimit(`admin:${gate.session.user.id}`, {
    window: 60,
    max: 30,
  });
  if (!limit.allowed) {
    return { error: "Too many actions. Wait a minute and try again." };
  }

  return gate;
}

export function auditFields(context: AdminContext) {
  return {
    actorType: "admin" as const,
    actorUserId: context.session.user.id,
    ip: context.ip,
    userAgent: context.userAgent,
  };
}

export function revalidateCreatorAdminViews(creatorId: string) {
  revalidatePath("/admin/creators");
  revalidatePath(`/admin/creators/${creatorId}`);
  revalidatePath("/admin/adjustments");
}
