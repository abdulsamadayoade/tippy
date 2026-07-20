type TipPeriod = "day" | "week" | "month" | "year";

type SummaryBannerProps = {
  total: number;
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
