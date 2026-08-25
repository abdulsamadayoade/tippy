type Tip = {
  id: string;
  name: string;
  amount: number;
  note: string;
  anonymous: boolean;
  initial: string;
  shade: "strong" | "default" | "subtle";
  time: string;
  createdAt: string;
  reference: string;
};

type TipFilter = "all" | "notes" | "anonymous";

type TipCursor = {
  createdAt: string;
  id: string;
};

type TipsPage = {
  tips: Tip[];
  nextCursor: TipCursor | null;
};

type TipSummary = {
  total: number;
  count: number;
  average: number;
  largest: number;
  supporters: number;
};

type TipPeriod = "day" | "week" | "month" | "year";

type TipPeriodTotals = Record<TipPeriod, { total: number; count: number }>;

type TipStats = {
  summary: TipSummary;
  periods: TipPeriodTotals;
};

type PayoutStatus = "pending" | "processing" | "paid" | "failed";

type Payout = {
  id: string;
  date: string;
  amount: number;
  status: PayoutStatus;
  reference: string;
};

type TipDraft = Pick<Tip, "amount" | "note" | "anonymous">;

type BankAccount = {
  bank: string;
  accountName: string;
  accountNumber: string;
};

type TipPreset = {
  amount: number;
  label: string;
};

type TipPresets = [TipPreset, TipPreset, TipPreset, TipPreset];

export type {
  Tip,
  TipFilter,
  TipCursor,
  TipsPage,
  TipSummary,
  TipPeriod,
  TipPeriodTotals,
  TipStats,
  Payout,
  PayoutStatus,
  TipDraft,
  BankAccount,
  TipPreset,
  TipPresets,
};
