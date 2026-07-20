"use client";

import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { MetricCard } from "@/modules/creator/components/metric-card";
import { TipList } from "@/modules/creator/components/tip-list";
import { TipListSkeleton, TipRowSkeleton } from "./components/skeleton";
import { useTipsFeed } from "./hooks/use-tips-feed";
import type { TipsProps } from "./types";

export function Tips({
  initialFilter,
  initialTips,
  initialCursor,
  summary,
}: TipsProps) {
  const { filter, setFilter, tips, status, retry, sentinelRef } = useTipsFeed({
    initialFilter,
    initialTips,
    initialCursor,
  });

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

      {status === "switching" ? (
        <TipListSkeleton className="mt-3.5" />
      ) : status === "switchError" ? (
        <div className="mt-3.5 flex flex-col items-center rounded-surface bg-white px-4 py-8 text-center shadow-surface">
          <p className="text-muted-text">
            Couldn’t load tips. Check your connection and try again.
          </p>
          <Button size="sm" variant="secondary" className="mt-4" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : (
        <TipList
          className="mt-3.5"
          emptyMessage="No tips in this view yet."
          id={`tip-filter-${filter}-panel`}
          labelledBy={`tip-filter-${filter}-tab`}
          tips={tips}
          footer={
            status === "loadingMore" ? (
              <>
                <TipRowSkeleton />
                <TipRowSkeleton />
                <span className="sr-only">Loading more tips…</span>
              </>
            ) : status === "moreError" ? (
              <p className="flex items-center justify-center gap-1.5 px-4 py-4 text-center text-ui-sm text-muted-text">
                Couldn’t load more tips.
                <button
                  className="cursor-pointer font-medium text-main-heading hover:underline"
                  type="button"
                  onClick={retry}>
                  Try again
                </button>
              </p>
            ) : null
          }
        />
      )}

      <div ref={sentinelRef} aria-hidden="true" />
    </section>
  );
}
