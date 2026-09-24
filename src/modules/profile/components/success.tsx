import { formatNaira } from "@/lib/utils";
import { PaySuccessIcon } from "@/components/icons/pay-success";
import { Button } from "@/components/ui/button";
import type { SuccessProps } from "../types";

export function Success({
  confettiRef,
  checkRef,
  checkState,
  amount,
  message,
  receiptEmail,
  creatorName,
  reset,
}: SuccessProps) {
  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-bg p-6"
      aria-labelledby="success-title">
      <canvas
        className="pointer-events-none absolute inset-0 size-full"
        ref={confettiRef}
      />
      <div className="relative max-w-95 text-center">
        <span
          ref={checkRef}
          className="group/success inline-block origin-center opacity-0 will-change-[transform,translate,opacity,filter] motion-safe:data-[state=in]:animate-success-reveal motion-reduce:opacity-100"
          data-state={checkState}
          aria-hidden="true">
          <PaySuccessIcon className="block size-16 overflow-visible [&_path]:[stroke-dasharray:20] [&_path]:[stroke-dashoffset:20] motion-safe:group-data-[state=in]/success:[&_path]:animate-success-draw motion-reduce:[&_path]:[stroke-dashoffset:0]" />
        </span>

        <h2
          className="mt-5.5 text-2xl font-medium tracking-display text-main-heading"
          id="success-title">
          Tip sent
        </h2>

        <p className="mt-2 text-base leading-normal">
          Your{" "}
          <strong className="font-semibold text-primary dark:text-main-heading">
            {formatNaira(amount)}
          </strong>{" "}
          tip is on its way to {creatorName}. Thanks for the support.
        </p>

        {receiptEmail && (
          <p className="mt-1.5 text-ui-sm text-muted-text">
            A receipt is on its way to {receiptEmail}.
          </p>
        )}

        {message.trim() && (
          <blockquote className="mt-4.5 rounded-surface bg-soft px-4 py-3.25">
            “{message.trim()}”
            <span className="mt-1.25 block text-xs text-muted-text-2">
              Your note was sent too
            </span>
          </blockquote>
        )}

        <div className="mt-6">
          <Button className="w-full" onClick={reset}>
            Tip {creatorName} again
          </Button>
        </div>
      </div>
    </section>
  );
}
