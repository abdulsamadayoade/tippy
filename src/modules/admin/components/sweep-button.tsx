"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runSweepAction } from "../actions/maintenance";
import { Button } from "@/components/ui/button";
import type { MonitorSweepSummary } from "@/lib/monitor";

export function SweepButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<MonitorSweepSummary | null>(null);

  async function run() {
    setRunning(true);
    setError("");
    const result = await runSweepAction();
    setRunning(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setSummary(result.summary);
    router.refresh();
  }

  return (
    <div>
      <Button size="sm" loading={running} loadingText="Sweeping…" onClick={run}>
        Run monitor sweep
      </Button>

      {error && (
        <p className="mt-3 text-sm text-danger" role="status">
          {error}
        </p>
      )}

      {summary && (
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm max-sm:grid-cols-1">
          <div className="rounded-md bg-soft p-3">
            <dt className="font-semibold text-main-heading">Tips</dt>
            <dd className="mt-1 text-muted-text">
              {summary.tips.checked} checked · {summary.tips.recovered}{" "}
              recovered · {summary.tips.closed} closed · {summary.tips.expired}{" "}
              expired · {summary.tips.errors} errors
            </dd>
          </div>
          <div className="rounded-md bg-soft p-3">
            <dt className="font-semibold text-main-heading">Payouts</dt>
            <dd className="mt-1 text-muted-text">
              {summary.payouts.checked} checked · {summary.payouts.closed}{" "}
              closed · {summary.payouts.stillOpen} still open ·{" "}
              {summary.payouts.errors} errors
            </dd>
          </div>
          <div className="rounded-md bg-soft p-3">
            <dt className="font-semibold text-main-heading">Wallet</dt>
            <dd className="mt-1 text-muted-text">
              {summary.wallet.checked
                ? summary.wallet.low
                  ? "Low — below liability"
                  : "Covers liability"
                : "Not checked"}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
