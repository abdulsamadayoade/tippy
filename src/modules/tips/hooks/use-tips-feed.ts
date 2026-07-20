"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { fetchTipsPage } from "../actions";
import { isTipFilter } from "../utils";
import type { Tip, TipCursor, TipFilter } from "@/types";
import type { Feed, FeedStatus } from "../types";

export function useTipsFeed({
  initialFilter,
  initialTips,
  initialCursor,
}: {
  initialFilter: TipFilter;
  initialTips: Tip[];
  initialCursor: TipCursor | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState<TipFilter>(initialFilter);
  const [feeds, setFeeds] = useState<Partial<Record<TipFilter, Feed>>>({
    [initialFilter]: { tips: initialTips, cursor: initialCursor },
  });
  const [status, setStatus] = useState<FeedStatus>("idle");

  // Mirrors of the latest state for use inside stable callbacks; synced in
  // effects, which commit before any event handler can fire.
  const feedsRef = useRef(feeds);
  const filterRef = useRef(filter);
  const statusRef = useRef(status);
  // Bumped on every filter change so late responses are dropped.
  const requestSeq = useRef(0);

  useEffect(() => {
    feedsRef.current = feeds;
  }, [feeds]);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const loadFirstPage = useCallback(async (targetFilter: TipFilter) => {
    const seq = ++requestSeq.current;
    setStatus("switching");
    const result = await fetchTipsPage({
      filter: targetFilter,
      cursor: null,
      loadedCount: 0,
    });

    if (seq !== requestSeq.current) return;
    if ("error" in result) {
      setStatus("switchError");
      return;
    }

    setFeeds((current) => ({
      ...current,
      [targetFilter]: { tips: result.tips, cursor: result.nextCursor },
    }));
    setStatus("idle");
  }, []);

  const applyFilter = useCallback(
    (nextFilter: TipFilter, { syncUrl = true } = {}) => {
      if (syncUrl) {
        const params = new URLSearchParams(searchParams.toString());

        if (nextFilter === "all") params.delete("filter");
        else params.set("filter", nextFilter);

        // Filtering never navigates — a shallow URL update keeps the view
        // shareable without a server round-trip.
        const query = params.toString();
        window.history.replaceState(
          null,
          "",
          query ? `${pathname}?${query}` : pathname,
        );
      }

      setFilter(nextFilter);

      if (feedsRef.current[nextFilter]) {
        requestSeq.current += 1;
        setStatus("idle");
        return;
      }

      void loadFirstPage(nextFilter);
    },
    [loadFirstPage, pathname, searchParams],
  );

  const loadMore = useCallback(async () => {
    if (statusRef.current !== "idle") return;

    const activeFilter = filterRef.current;
    const feed = feedsRef.current[activeFilter];
    if (!feed?.cursor) return;

    const seq = requestSeq.current;
    setStatus("loadingMore");
    const result = await fetchTipsPage({
      filter: activeFilter,
      cursor: feed.cursor,
      loadedCount: feed.tips.length,
    });

    if (seq !== requestSeq.current) return;
    if ("error" in result) {
      setStatus("moreError");
      return;
    }

    setFeeds((current) => {
      const existing = current[activeFilter];
      if (!existing) return current;

      // A tip arriving mid-scroll can't duplicate rows with a keyset cursor,
      // but dedupe anyway so a retried request stays harmless.
      const seen = new Set(existing.tips.map(({ id }) => id));

      return {
        ...current,
        [activeFilter]: {
          tips: [
            ...existing.tips,
            ...result.tips.filter(({ id }) => !seen.has(id)),
          ],
          cursor: result.nextCursor,
        },
      };
    });
    setStatus("idle");
  }, []);

  const loadMoreRef = useRef(loadMore);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  const retry = useCallback(() => {
    if (statusRef.current === "switchError") {
      void loadFirstPage(filterRef.current);
      return;
    }

    if (statusRef.current === "moreError") {
      statusRef.current = "idle";
      setStatus("idle");
      void loadMoreRef.current();
    }
  }, [loadFirstPage]);

  // Back/forward (and any external navigation) drives the filter from the URL.
  useEffect(() => {
    const requested = searchParams.get("filter");
    const urlFilter = isTipFilter(requested) ? requested : "all";
    if (urlFilter !== filterRef.current) {
      applyFilter(urlFilter, { syncUrl: false });
    }
  }, [searchParams, applyFilter]);

  const activeFeed = feeds[filter];
  const tipCount = activeFeed?.tips.length ?? 0;

  // Re-observe whenever the list grows or the filter changes: if the sentinel
  // is still in view after an append, a fresh observation fires immediately.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreRef.current();
        }
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filter, tipCount]);

  return {
    filter,
    setFilter: applyFilter,
    tips: activeFeed?.tips ?? [],
    status,
    retry,
    sentinelRef,
  };
}
