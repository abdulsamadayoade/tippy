import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reportError, reportWarning } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 5_000;
/** Uptime monitors poll every minute; during an outage this caps Sentry to
 *  one event per interval per warm instance. The uptime monitor is the alarm —
 *  this capture is corroborating telemetry, not the alerting channel. */
const REPORT_INTERVAL_MS = 10 * 60_000;
let lastReportedAt = 0;

/** Slow ≠ down: a saturated pool/compute inflates SELECT 1 latency long
 *  before it fails. Per-instance pg pool stats are meaningless on Vercel —
 *  the Neon dashboard (Monitoring → Connections) is the authoritative view
 *  of connection spikes; this is the in-app early-warning proxy. */
const SLOW_DB_MS = 2_000;
let lastSlowReportedAt = 0;

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
    const startedAt = Date.now();
    await checkDatabase();
    const latencyMs = Date.now() - startedAt;

    if (
      latencyMs > SLOW_DB_MS &&
      Date.now() - lastSlowReportedAt > REPORT_INTERVAL_MS
    ) {
      lastSlowReportedAt = Date.now();
      reportWarning(`Health check DB latency ${latencyMs}ms`, {
        category: "db.health",
        tags: { kind: "slow" },
        extra: { latencyMs },
        fingerprint: ["health-check-slow-db"],
      });
    }

    // Still healthy — the uptime monitor stays quiet; Sentry gets the signal.
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
