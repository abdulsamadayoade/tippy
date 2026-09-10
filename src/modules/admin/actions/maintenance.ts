"use server";

import { revalidatePath } from "next/cache";
import { db, withAdvisoryLock, LOCK_KEYS } from "@/lib/db";
import { writeAuditSafe } from "@/lib/audit";
import { runMonitorSweep, type MonitorSweepSummary } from "@/lib/monitor";
import { auditFields, requireAdminWithLimit } from "./internal";

export async function runSweepAction(): Promise<
  { error: string } | { summary: MonitorSweepSummary }
> {
  const context = await requireAdminWithLimit();
  if ("error" in context) return { error: context.error };

  const outcome = await withAdvisoryLock(LOCK_KEYS.monitorSweep, () =>
    runMonitorSweep(),
  );

  if (!outcome.acquired) {
    return { error: "A sweep is already running. Try again shortly." };
  }

  await writeAuditSafe(db, {
    ...auditFields(context),
    action: "monitor.sweep",
    details: { summary: outcome.result as unknown as Record<string, unknown> },
  });

  revalidatePath("/admin");
  return { summary: outcome.result };
}
