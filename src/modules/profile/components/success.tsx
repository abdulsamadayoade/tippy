import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SuccessProps } from "../types";

export function Success({
  confettiRef,
  checkRef,
  checkState,
  amount,
  message,
  creatorName,
  reset,
}: SuccessProps) {
  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-white p-6"
      aria-labelledby="success-title">
      <canvas
        className="pointer-events-none absolute inset-0 size-full"
        ref={confettiRef}
      />
      <div className="relative max-w-95 text-center">
        <span
          ref={checkRef}
          className="t-success-check"
          data-state={checkState}
          aria-hidden="true">
          <span className="flex size-16 items-center justify-center rounded-full bg-success text-white">
            <svg
              className="size-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path
                pathLength={20}
                d="M5 13.2592L7.58583 15.9568C8.2525 16.6523 8.58583 17.0001 9.00004 17.0001C9.41425 17.0001 9.74759 16.6523 10.4143 15.9568L19 7.00006"
              />
            </svg>
          </span>
        </span>

        <h2
          className="mt-5.5 text-2xl font-medium tracking-[-0.02em] text-main-heading"
          id="success-title">
          Tip sent
        </h2>

        <p className="mt-2 text-base leading-normal">
          Your{" "}
          <strong className="font-semibold text-primary">
            {formatNaira(amount)}
          </strong>{" "}
          tip is on its way to {creatorName}. Thanks for the
          support.
        </p>

        {message.trim() && (
          <blockquote className="mt-4.5 rounded-[14px] bg-soft px-4 py-3.25">
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
