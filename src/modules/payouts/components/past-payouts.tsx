import { cn } from "@/lib/cn";
import { formatDate, formatNaira } from "@/lib/utils";
import { STATUS_CHIPS } from "../data";
import type { PastPayoutsProps } from "../types";

export function PastPayouts({ payouts }: PastPayoutsProps) {
  return (
    <section className="mt-7" aria-labelledby="payout-history-heading">
      <h2
        className="text-base leading-[1.3] font-medium text-main-heading"
        id="payout-history-heading">
        Past payouts
      </h2>
      <div className="mt-3 flex flex-col rounded-surface bg-white p-1 shadow-surface">
        {payouts.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-text">
            No payouts yet — your withdrawals will show up here.
          </p>
        ) : (
          payouts.map((payout) => {
            const chip = STATUS_CHIPS[payout.status];

            return (
              <article
                className="grid grid-cols-[minmax(0,1fr)_auto_minmax(82px,auto)] items-center gap-3 rounded-[10px] p-3.5 transition-colors duration-150 hover:bg-soft max-phone:grid-cols-[minmax(0,1fr)_auto]"
                key={payout.id}>
                <div>
                  <h3 className="text-sm font-medium text-main-heading">
                    {formatDate(payout.date)}
                  </h3>
                  <p className="mt-px text-xs text-muted-text">
                    {payout.reference}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.75 text-xs font-medium whitespace-nowrap max-phone:col-start-1 max-phone:row-start-2 max-phone:justify-self-start",
                    chip.className,
                  )}>
                  {chip.label}
                </span>
                <strong className="text-right text-base font-medium whitespace-nowrap text-main-heading max-phone:col-start-2 max-phone:row-span-2 max-phone:row-start-1">
                  {formatNaira(payout.amount)}
                  <span className="block text-xs font-normal text-muted-text">
                    Monnify fee {formatNaira(payout.providerFeeAmount)}
                  </span>
                </strong>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
