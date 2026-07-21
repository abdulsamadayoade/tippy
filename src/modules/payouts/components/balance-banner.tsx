import { CheckIcon } from "@/components/icons/check";
import { BankBuildingIcon } from "@/components/icons/bank-building";
import { formatDate, formatNaira, getNextPayoutDate } from "@/lib/utils";
import type { BalanceBannerProps } from "../types";

export function BalanceBanner({
  total,
  hasAccount,
  autoPayout,
  canWithdraw,
  withdrawalRequested,
  onWithdraw,
}: BalanceBannerProps) {
  const nextPayoutDate = formatDate(getNextPayoutDate(), {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <article className="creator-banner-grid mt-5 flex flex-wrap items-end justify-between gap-4 rounded-[18px] bg-primary p-6 text-white max-phone:p-5">
      <div>
        <p className="text-xs font-medium tracking-label text-white/55 uppercase">
          Available balance
        </p>
        <strong className="mt-2.5 block text-2xl font-medium tracking-display">
          {formatNaira(total)}
        </strong>
        <small className="mt-2.5 block text-xs text-white/50">
          {hasAccount && autoPayout
            ? `Next automatic payout · ${nextPayoutDate}`
            : "Automatic payouts are off"}
        </small>
      </div>
      {hasAccount ? (
        <button
          className="major-button major-button-light inline-flex cursor-pointer items-center gap-1.75 rounded-full bg-white px-3.5 py-2 text-ui-sm font-medium text-main-heading transition-transform duration-100 active:scale-[0.98] disabled:cursor-default disabled:opacity-70"
          type="button"
          data-no-hover
          disabled={!canWithdraw}
          onClick={onWithdraw}>
          {withdrawalRequested ? (
            <CheckIcon className="size-4 stroke-2" />
          ) : (
            <BankBuildingIcon className="size-4" />
          )}
          {withdrawalRequested
            ? "Withdrawal pending"
            : total
              ? "Withdraw now"
              : "No balance yet"}
        </button>
      ) : null}
    </article>
  );
}
