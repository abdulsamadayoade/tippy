import type { Tip, TipCursor, TipFilter, TipSummary } from "@/types";

type TipsProps = {
  initialFilter: TipFilter;
  initialTips: Tip[];
  initialCursor: TipCursor | null;
  summary: TipSummary;
};

type Feed = { tips: Tip[]; cursor: TipCursor | null };

type FeedStatus =
  | "idle"
  | "switching"
  | "switchError"
  | "loadingMore"
  | "moreError";

export type { TipFilter, TipsProps, Feed, FeedStatus };
