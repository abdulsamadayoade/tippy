import type { TipPeriod } from "@/types";

type SummaryBannerProps = {
  total: number;
  gross: number;
  count: number;
  automaticPayoutActive: boolean;
  period: TipPeriod;
  onPeriodChange: (period: TipPeriod) => void;
};

type PeriodMenuProps = {
  period: TipPeriod;
  onPeriodChange: (period: TipPeriod) => void;
};

export type { TipPeriod, SummaryBannerProps, PeriodMenuProps };
