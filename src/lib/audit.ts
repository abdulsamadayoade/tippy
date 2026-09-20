import type { DbExecutor } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { reportError } from "@/lib/monitoring";

type AuditEntry = {
  actorType: "admin" | "creator" | "system";
  actorUserId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
};

async function writeAudit(
  executor: DbExecutor,
  entry: AuditEntry,
): Promise<void> {
  await executor.insert(auditLog).values({
    actorType: entry.actorType,
    actorUserId: entry.actorUserId ?? null,
    action: entry.action,
    targetType: entry.targetType ?? null,
    targetId: entry.targetId ?? null,
    details: entry.details ?? null,
    ip: entry.ip ?? null,
    userAgent: entry.userAgent ?? null,
  });
}

async function writeAuditSafe(
  executor: DbExecutor,
  entry: AuditEntry,
): Promise<void> {
  try {
    await writeAudit(executor, entry);
  } catch (error) {
    reportError(error, {
      category: "audit.write",
      extra: { action: entry.action, targetType: entry.targetType },
    });
  }
}

export { type AuditEntry, writeAudit, writeAuditSafe };
