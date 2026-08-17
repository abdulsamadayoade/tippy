import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportError } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 5_000;
/** Uptime monitors poll every minute; during an outage this caps Sentry to
 *  one event per interval per warm instance. The uptime monitor is the alarm —
 *  this capture is corroborating telemetry, not the alerting channel. */
const REPORT_INTERVAL_MS = 10 * 60_000;
let lastReportedAt = 0;

async function checkDatabase(): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(`Database health check timed out after ${DB_TIMEOUT_MS}ms`),
        ),
      DB_TIMEOUT_MS,
    );
  });

  try {
    await Promise.race([db.execute(sql`SELECT 1`), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  try {
    await checkDatabase();
    return NextResponse.json({ status: "healthy" });
  } catch (error) {
    if (Date.now() - lastReportedAt > REPORT_INTERVAL_MS) {
      lastReportedAt = Date.now();
      reportError(error, {
        category: "db.health",
        fingerprint: ["health-check-unhealthy"],
      });
    }
    // Deliberately bare — never expose connection details or error text.
    return NextResponse.json({ status: "unhealthy" }, { status: 503 });
  }
}
