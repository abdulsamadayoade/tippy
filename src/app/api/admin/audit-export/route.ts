import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { user } from "@/lib/db/auth-schema";
import { checkAdminAccess } from "@/lib/admin-session";
import { writeAuditSafe } from "@/lib/audit";
import { reportError } from "@/lib/monitoring";
import {
  auditLogConditions,
  type AuditLogFilters,
} from "@/modules/admin/queries";

const PAGE_SIZE = 1000;

const HEADER = [
  "id",
  "created_at",
  "actor_type",
  "actor_email",
  "action",
  "target_type",
  "target_id",
  "details",
  "ip",
  "user_agent",
];

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

function parseFilters(url: URL): AuditLogFilters {
  const filters: AuditLogFilters = {};
  const actor = url.searchParams.get("actor");
  if (actor === "admin" || actor === "creator" || actor === "system") {
    filters.actorType = actor;
  }

  const action = url.searchParams.get("action")?.trim();
  if (action) filters.action = action;

  const from = url.searchParams.get("from");
  if (from) {
    const date = new Date(from);
    if (!Number.isNaN(date.getTime())) filters.from = date;
  }
  const to = url.searchParams.get("to");
  if (to) {
    const date = new Date(`${to}T23:59:59.999`);
    if (!Number.isNaN(date.getTime())) filters.to = date;
  }

  return filters;
}

export async function GET(request: Request) {
  const gate = await checkAdminAccess();
  if (gate.status !== "ok") {
    return new Response("Not authorized", { status: 403 });
  }

  const url = new URL(request.url);
  const filters = parseFilters(url);
  const baseConditions = auditLogConditions(filters);

  await writeAuditSafe(db, {
    actorType: "admin",
    actorUserId: gate.session.user.id,
    action: "audit.export",
    details: { filters: JSON.parse(JSON.stringify(filters)) },
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(`${HEADER.join(",")}\n`));

      let lastId = 0;
      try {
        for (;;) {
          const rows = await db
            .select({
              id: auditLog.id,
              createdAt: auditLog.createdAt,
              actorType: auditLog.actorType,
              actorEmail: user.email,
              action: auditLog.action,
              targetType: auditLog.targetType,
              targetId: auditLog.targetId,
              details: auditLog.details,
              ip: auditLog.ip,
              userAgent: auditLog.userAgent,
            })
            .from(auditLog)
            .leftJoin(user, eq(auditLog.actorUserId, user.id))
            .where(and(gt(auditLog.id, lastId), ...baseConditions))
            .orderBy(asc(auditLog.id))
            .limit(PAGE_SIZE);

          if (rows.length === 0) break;

          const chunk = rows
            .map((row) =>
              [
                row.id,
                row.createdAt,
                row.actorType,
                row.actorEmail,
                row.action,
                row.targetType,
                row.targetId,
                row.details ? JSON.stringify(row.details) : "",
                row.ip,
                row.userAgent,
              ]
                .map(csvCell)
                .join(","),
            )
            .join("\n");

          controller.enqueue(encoder.encode(`${chunk}\n`));
          lastId = rows[rows.length - 1].id;

          if (rows.length < PAGE_SIZE) break;
        }
        controller.close();
      } catch (error) {
        reportError(error, {
          category: "admin.export",
          fingerprint: ["audit-export-failed"],
        });
        controller.error(error);
      }
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tippy-audit-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
