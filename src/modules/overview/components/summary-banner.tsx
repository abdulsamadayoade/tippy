import { MonnifyLogo } from "@/components/elements/monnify-logo";
import { NEXT_PAYOUT_DATE } from "@/data/constants";
import { formatDate, formatNaira } from "@/lib/utils";
import { PeriodMenu } from "./period-menu";
import type { SummaryBannerProps } from "../types";

export function SummaryBanner({
  total,
  count,
  automaticPayoutActive,
  period,
  onPeriodChange,
}: SummaryBannerProps) {
  return (
    <article className="creator-banner-grid col-span-full flex flex-wrap items-end justify-between gap-4 rounded-[18px] bg-primary p-6 text-white max-phone:p-5">
      <div>
        <PeriodMenu period={period} onPeriodChange={onPeriodChange} />
        <strong className="mt-2.5 block text-2xl font-medium tracking-display">
          {formatNaira(total)}
        </strong>
        <span className="mt-3 inline-flex items-center gap-1.25 rounded-full bg-white/12 px-2.5 py-1 text-xs font-medium text-white/85">
          {count} {count === 1 ? "tip" : "tips"} received
        </span>
      </div>
      <div className="text-right max-phone:flex max-phone:w-full max-phone:items-center max-phone:justify-between max-phone:border-t max-phone:border-white/12 max-phone:pt-3.5 max-phone:text-left">
        <div>
          <span className="block text-xs text-white/50">
            {automaticPayoutActive ? "Next payout" : "Automatic payout"}
          </span>
          <strong className="mt-0.75 block text-sm font-medium max-phone:mt-0">
            {automaticPayoutActive
              ? formatDate(NEXT_PAYOUT_DATE, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
              : "Paused"}
          </strong>
        </div>
        <small className="mt-2 block text-xs text-white/50 max-phone:mt-0">
          {automaticPayoutActive ? (
            <span className="inline-flex items-center justify-end gap-1 max-phone:justify-start">
              <span>via</span>
              <MonnifyLogo className="h-2.5 w-auto text-white/70" />
            </span>
          ) : (
            "Manage in Payouts"
          )}
        </small>
      </div>
    </article>
  );
}
