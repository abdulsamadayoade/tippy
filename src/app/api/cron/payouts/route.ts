import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { runAutoPayouts } from "@/lib/payouts";
import { reportError, reportWarning } from "@/lib/monitoring";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    reportWarning(
      "CRON_SECRET is not configured — auto payouts are disabled.",
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
    // withMonitor reports start/ok/error check-ins and upserts the Sentry
    // Cron monitor, so a run that never starts alerts as a missed check-in.
    const results = await Sentry.withMonitor(
      "weekly-auto-payouts",
      () => runAutoPayouts(),
      {
        schedule: { type: "crontab", value: "0 9 * * 5" },
        checkinMargin: 60,
        maxRuntime: 5,
        timezone: "Etc/UTC",
      },
    );
    const failed = results.filter((result) => result.error).length;

    if (failed > 0) {
      reportWarning(
        `Auto payout run finished with ${failed}/${results.length} failures`,
        {
          category: "payout.auto",
          extra: { ran: results.length, failed },
        },
      );
    }

    return NextResponse.json({ ran: results.length, results });
  } catch (error) {
    reportError(error, {
      category: "payout.auto",
      fingerprint: ["auto-payout-run-crashed"],
    });
    return NextResponse.json(
      { message: "Auto payout run failed." },
      { status: 500 },
    );
  }
}
