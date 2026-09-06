"use client";

import { useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/modules/creator/components/metric-card";
import { TipList } from "@/modules/creator/components/tip-list";
import { formatNaira } from "@/lib/utils";
import { SummaryBanner } from "./components/summary-banner";
import { ShareLinkCard } from "./components/share-link-card";
import type { Tip, TipPeriodTotals, TipSummary } from "@/types";
import type { TipPeriod } from "./types";

export function Overview({
  displayName,
  username,
  tips,
  summary,
  periodTotals,
  automaticPayoutActive,
}: {
  displayName: string;
  username: string;
  tips: Tip[];
  summary: TipSummary;
  periodTotals: TipPeriodTotals;
  automaticPayoutActive: boolean;
}) {
  const [period, setPeriod] = useState<TipPeriod>("month");
  const periodSummary = periodTotals[period];

  return (
    <section
      id="creator-overview-panel"
      aria-labelledby="creator-overview-link">
      <p className="text-ui-sm text-muted-text">
        Good to see you, {displayName}.
      </p>
      <h1 className="mt-0.5 text-lg leading-page-heading font-medium tracking-display text-main-heading">
        Here’s what your community sent.
      </h1>

      <div className="mt-5.5 grid grid-cols-3 gap-3 max-dashboard:grid-cols-2 max-phone-sm:grid-cols-1">
        <SummaryBanner
          total={periodSummary.total}
          gross={periodSummary.gross}
          count={periodSummary.count}
          automaticPayoutActive={automaticPayoutActive}
          period={period}
          onPeriodChange={setPeriod}
        />

        <MetricCard label="Supporters" value={String(summary.supporters)} />
        <MetricCard label="Largest tip" value={formatNaira(summary.largest)} />
        <MetricCard
          className="max-dashboard:col-span-2 max-phone-sm:col-span-1"
          label="Average tip"
          value={formatNaira(summary.average)}
        />
      </div>

      <ShareLinkCard username={username} />

      <section className="mt-7" aria-labelledby="recent-tips-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            className="text-base font-medium text-main-heading"
            id="recent-tips-heading">
            Latest tips
          </h2>
          {summary.count > tips.length ? (
            <Link
              className="text-ui-sm font-medium text-body-text/80 transition-colors duration-150 hover:text-main-heading"
              href="/tips">
              View all
            </Link>
          ) : null}
        </div>
        <TipList className="mt-3" tips={tips} />
      </section>
    </section>
  );
}
