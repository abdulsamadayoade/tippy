import type { TipPeriod } from "./types";

const PERIOD_OPTIONS: { value: TipPeriod; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];

const PERIOD_LABELS: Record<TipPeriod, string> = {
  day: "Tips today",
  week: "Tips this week",
  month: "Tips this month",
  year: "Tips this year",
};

export { PERIOD_OPTIONS, PERIOD_LABELS };
