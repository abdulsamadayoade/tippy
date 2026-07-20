"use client";

import { useState } from "react";
import { usePayoutAccount, useTips } from "@/store/providers";
import { MetricCard } from "@/modules/creator/metric-card";
import { TipList } from "@/modules/creator/tip-list";
import { formatNaira, getTipSummary } from "@/lib/utils";
import { SummaryBanner } from "./components/summary-banner";
import { ShareLinkCard } from "./components/share-link-card";
import { filterTipsByPeriod } from "./utils";
import type { TipPeriod } from "./types";

export function Overview({
  displayName,
  username,
}: {
  displayName: string;
  username: string;
}) {
  const { tips } = useTips();
  const { account, autoPayout } = usePayoutAccount();
  const [period, setPeriod] = useState<TipPeriod>("month");
  const summary = getTipSummary(tips);
  const periodSummary = getTipSummary(filterTipsByPeriod(tips, period));
  const automaticPayoutActive = Boolean(account) && autoPayout;

  return (
    <section
      id="creator-overview-panel"
      aria-labelledby="creator-overview-link">
      <p className="text-[13px] text-muted-text">
        Good to see you, {displayName}.
      </p>
      <h1 className="mt-0.5 text-lg leading-[1.35] font-medium tracking-[-0.02em] text-main-heading">
        Here’s what your community sent.
      </h1>

      <div className="mt-5.5 grid grid-cols-3 gap-3 max-[680px]:grid-cols-2 max-[360px]:grid-cols-1">
        <SummaryBanner
          total={periodSummary.total}
          count={periodSummary.count}
          automaticPayoutActive={automaticPayoutActive}
          period={period}
          onPeriodChange={setPeriod}
        />

        <MetricCard label="Supporters" value={String(summary.supporters)} />
        <MetricCard label="Largest tip" value={formatNaira(summary.largest)} />
        <MetricCard
          className="max-[680px]:col-span-2 max-[360px]:col-span-1"
          label="Average tip"
          value={formatNaira(summary.average)}
        />
      </div>

      <ShareLinkCard username={username} />

      <section className="mt-7" aria-labelledby="recent-tips-heading">
        <h2
          className="text-base font-medium text-main-heading"
          id="recent-tips-heading">
          Latest tips
        </h2>
        <TipList className="mt-3" tips={tips} />
      </section>
    </section>
  );
}
