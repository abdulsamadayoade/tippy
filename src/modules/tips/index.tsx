"use client";

import { useTips } from "@/store/providers";
import { formatNaira, getTipSummary } from "@/lib/utils";
import { MetricCard } from "@/modules/creator/components/metric-card";
import { TipList } from "@/modules/creator/components/tip-list";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { useTipFilter } from "./hooks/use-tip-filter";

export function Tips() {
  const { tips } = useTips();
  const { filter, setFilter, filteredTips } = useTipFilter(tips);
  const summary = getTipSummary(tips);

  return (
    <section id="creator-tips-panel" aria-labelledby="creator-tips-link">
      <h1 className="mt-0.5 text-lg leading-page-heading font-medium tracking-display text-main-heading">
        Tips
      </h1>
      <p className="mt-0.5 text-ui-sm text-muted-text">
        See who tipped, what they sent, and the notes they left.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3 max-dashboard:grid-cols-2 max-phone-sm:grid-cols-1">
        <MetricCard
          className="max-dashboard:col-span-2 max-phone-sm:col-span-1"
          label="Total received"
          value={formatNaira(summary.total)}
        />
        <MetricCard label="Tips received" value={String(summary.count)} />
        <MetricCard label="Average tip" value={formatNaira(summary.average)} />
      </div>

      <SlidingTabs
        idPrefix="tip-filter"
        className="mt-5 text-ui-sm font-medium"
        label="Filter tips"
        options={[
          { value: "all", label: "All" },
          { value: "notes", label: "With a note" },
          { value: "anonymous", label: "Anonymous" },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <TipList
        className="mt-3.5"
        emptyMessage="No tips in this view yet."
        id={`tip-filter-${filter}-panel`}
        labelledBy={`tip-filter-${filter}-tab`}
        tips={filteredTips}
      />
    </section>
  );
}
