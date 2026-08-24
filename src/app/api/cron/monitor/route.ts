import { NextResponse } from "next/server";
import { LOCK_KEYS, withAdvisoryLock } from "@/lib/db";
import { runMonitorSweep, withCronMonitor } from "@/lib/monitor";
import { reportError, reportWarning } from "@/lib/monitoring";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    reportWarning(
      "CRON_SECRET is not configured — the monitor sweep is disabled.",
      {
        category: "cron.config",
        fingerprint: ["cron-secret-missing"],
      },
    );
    return NextResponse.json(
      { message: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Lock outside the monitor so a concurrent duplicate skips without
    // reporting a phantom check-in; the winner reports start/ok/error.
    const outcome = await withAdvisoryLock(LOCK_KEYS.monitorSweep, () =>
      withCronMonitor("monitor-sweep", () => runMonitorSweep(), {
        schedule: { type: "crontab", value: "*/10 * * * *" },
        checkinMargin: 20, // GitHub Actions timing is best-effort
        maxRuntime: 5,
        timezone: "Etc/UTC",
      }),
    );

    if (!outcome.acquired) {
      return NextResponse.json({ skipped: true });
    }
    return NextResponse.json(outcome.result);
  } catch (error) {
    reportError(error, {
      category: "monitor.sweep",
      fingerprint: ["monitor-sweep-crashed"],
    });
    return NextResponse.json(
      { message: "Monitor sweep failed." },
      { status: 500 },
    );
  }
}
