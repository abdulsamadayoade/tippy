import { NextResponse } from "next/server";
import { LOCK_KEYS, withAdvisoryLock } from "@/lib/db";
import {
  checkWalletCoverageForAutoPayouts,
  withCronMonitor,
} from "@/lib/monitor";
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

  // Warn-only pre-flight: can the wallet cover what this run may disburse?
  await checkWalletCoverageForAutoPayouts();

  try {
    // Advisory lock guards Vercel's occasional duplicate cron delivery (the
    // balance re-check in createPendingPayout already makes duplicates safe
    // at the money level — this avoids wasted Monnify calls). Lock sits
    // outside withMonitor so the losing invocation reports no phantom
    // check-in; the winner reports start/ok/error, and a run that never
    // starts alerts as a missed check-in.
    const outcome = await withAdvisoryLock(LOCK_KEYS.autoPayouts, () =>
      withCronMonitor("weekly-auto-payouts", () => runAutoPayouts(), {
        schedule: { type: "crontab", value: "0 9 * * 5" },
        checkinMargin: 60,
        maxRuntime: 5,
        timezone: "Etc/UTC",
      }),
    );

    if (!outcome.acquired) {
      // A concurrent duplicate is expected behavior, not a failure.
      return NextResponse.json({ skipped: true });
    }

    const results = outcome.result;
    const failed = results.filter((result) => result.error).length;

    if (failed > 0) {
      reportWarning(
        `Auto payout run finished with ${failed}/${results.length} failures`,
        {
          category: "payout.auto",
          extra: { ran: results.length, failed },
          fingerprint: ["auto-payout-run-failures"],
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
