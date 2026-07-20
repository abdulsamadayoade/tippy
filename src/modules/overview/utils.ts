import type { Tip } from "@/store/types";
import type { TipPeriod } from "./types";

function periodStart(period: TipPeriod, now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "week") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  } else if (period === "month") {
    start.setDate(1);
  } else if (period === "year") {
    start.setMonth(0, 1);
  }

  return start;
}

function filterTipsByPeriod(tips: Tip[], period: TipPeriod, now = new Date()) {
  const start = periodStart(period, now);
  return tips.filter((tip) => new Date(tip.createdAt) >= start);
}

export { filterTipsByPeriod };
