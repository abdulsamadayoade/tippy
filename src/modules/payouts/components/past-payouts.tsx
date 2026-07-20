import { formatDate, formatNaira } from "@/lib/utils";
import type { PastPayoutsProps } from "../types";

export function PastPayouts({ payouts }: PastPayoutsProps) {
  return (
    <section className="mt-7" aria-labelledby="payout-history-heading">
      <h2
        className="text-base leading-[1.3] font-medium text-main-heading"
        id="payout-history-heading">
        Past payouts
      </h2>
      <div className="mt-3 flex flex-col rounded-[14px] bg-white p-1 shadow-surface">
        {payouts.map((payout) => (
          <article
            className="grid grid-cols-[minmax(0,1fr)_auto_minmax(82px,auto)] items-center gap-3 rounded-[10px] p-3.5 transition-colors duration-150 hover:bg-soft max-[460px]:grid-cols-[minmax(0,1fr)_auto]"
            key={payout.id}>
            <div>
              <h3 className="text-sm font-medium text-main-heading">
                {formatDate(payout.date)}
              </h3>
              <p className="mt-px text-xs text-muted-text">
                {payout.reference}
              </p>
            </div>
            <span className="rounded-full bg-success-soft px-2.5 py-0.75 text-xs font-medium whitespace-nowrap text-success max-[460px]:col-start-1 max-[460px]:row-start-2 max-[460px]:justify-self-start">
              {payout.status}
            </span>
            <strong className="text-right text-base font-medium whitespace-nowrap text-main-heading max-[460px]:col-start-2 max-[460px]:row-span-2 max-[460px]:row-start-1">
              {formatNaira(payout.amount)}
            </strong>
          </article>
        ))}
      </div>
    </section>
  );
}
