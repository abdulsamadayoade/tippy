import type { Tip, TipCursor, TipFilter, TipSummary } from "@/types";

type TipsProps = {
  initialFilter: TipFilter;
  initialTips: Tip[];
  initialCursor: TipCursor | null;
  summary: TipSummary;
};

export type { TipFilter, TipsProps };
