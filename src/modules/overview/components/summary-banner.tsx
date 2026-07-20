import { MonnifyLogo } from "@/components/elements/monnify-logo";
import { NEXT_PAYOUT_DATE } from "@/data/constants";
import { formatDate, formatNaira } from "@/lib/utils";
import type { SummaryBannerProps } from "../types";

export function SummaryBanner({
  total,
  count,
  automaticPayoutActive,
}: SummaryBannerProps) {
  return (
    <article className="creator-banner-grid col-span-full flex flex-wrap items-end justify-between gap-4 rounded-[18px] bg-primary p-6 text-white max-[460px]:p-5">
      <div>
        <p className="text-xs font-medium tracking-[0.03em] text-white/55 uppercase">
          Tips this month
        </p>
        <strong className="mt-2.5 block text-2xl font-medium tracking-[-0.02em]">
          {formatNaira(total)}
        </strong>
        <span className="mt-3 inline-flex items-center gap-1.25 rounded-full bg-white/12 px-2.5 py-1 text-xs font-medium text-white/85">
          {count} {count === 1 ? "tip" : "tips"} received
        </span>
      </div>
      <div className="text-right max-[460px]:flex max-[460px]:w-full max-[460px]:items-center max-[460px]:justify-between max-[460px]:border-t max-[460px]:border-white/12 max-[460px]:pt-3.5 max-[460px]:text-left">
        <div>
          <span className="block text-xs text-white/50">
            {automaticPayoutActive ? "Next payout" : "Automatic payout"}
          </span>
          <strong className="mt-0.75 block text-sm font-medium max-[460px]:mt-0">
            {automaticPayoutActive
              ? formatDate(NEXT_PAYOUT_DATE, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
              : "Paused"}
          </strong>
        </div>
        <small className="mt-2 block text-xs text-white/50 max-[460px]:mt-0">
          {automaticPayoutActive ? (
            <span className="inline-flex items-center justify-end gap-1 max-[460px]:justify-start">
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
